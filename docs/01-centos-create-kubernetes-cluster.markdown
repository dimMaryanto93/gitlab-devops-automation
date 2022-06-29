# Installing Kubernetes cluster

Kita siapkan host yang akan di install kubernetes, sebagai contoh disini saya menggunakan CentOS 7 dengan konfigurasi minimal sebagai berikut:

```yaml
Master-Node:
    - NodeName: 'k8s-master'
      CPU: '2 Cores' or more.
      RAM: '2 GB' or more
      Storage: '50 GB'
        partision: 
          - / = "20 Gb"
          - /var = "30 Gb"
          - swap = "Disabled"
      Network: # Full network connectivity between all machines in the cluster (public or private network is fine).
        - IP4: 'Brige (192.168.99.10)'
        - hostname: 'k8s-cpdev01.dimas-maryanto.com' # Unique hostname, MAC address, and product_uuid for every node.
Worker-Nodes: 
    - NodeName: 'k8s-worker1'
      CPU: '2 Cores' or more.
      RAM: '2 GB' or more.
      Storage: '50 GB'
        partision:
          - / = "20 Gb"
          - /var = "30 Gb"
          - swap = "Disabled"
      Network: # Full network connectivity between all machines in the cluster (public or private network is fine).
        - IP4: 'Brige (192.168.88.14x)'
        - hostname: 'k8s-wdev01.dimas-maryanto.com' # Unique hostname, MAC address, and product_uuid for every node.
```

Verify the MAC address and product_uuid are unique for every node

1. You can get the MAC address of the network interfaces using the command `ip link` or `ifconfig -a`
2. The product_uuid can be checked by using the command `sudo cat /sys/class/dmi/id/product_uuid`

It is very likely that hardware devices will have unique addresses, although some virtual machines may have identical values. Kubernetes uses these values to uniquely identify the nodes in the cluster. If these values are not unique to each node, the installation process may [fail](https://github.com/kubernetes/kubeadm/issues/31).

## Setup & install commons package

Sebelum kita install, disini saya mau install dulu commons package seperti `curl`, `wget`, `yum-utils`, `net-tools` dan lain-lain.

```bash
# update system
yum update -y && \
yum install -y epel-release && \
yum install -y net-tools git nc curl wget yum-utils vim tmux tc && \
yum install -y device-mapper-persistent-data lvm2 fuse-overlayfs
```

Disable swap partition permanently, edit file `/etc/fstab` comment `/dev/mapper/cl-swap` like this:

```conf
#
# /etc/fstab
# Created by anaconda on Tue Jul 20 08:07:33 2021
#
# Accessible filesystems, by reference, are maintained under '/dev/disk/'.
# See man pages fstab(5), findfs(8), mount(8) and/or blkid(8) for more info.
#
# After editing this file, run 'systemctl daemon-reload' to update systemd
# units generated from this file.
#
/dev/mapper/cl-root                         /                       xfs     defaults        0 0
UUID=4ec37475-d403-4466-b2bf-318dfd409092   /boot                   ext4    defaults        1 2
/dev/mapper/cl-var                          /var                    xfs     defaults        0 0
#/dev/mapper/cl-swap                        swap                    swap    defaults        0 0
```

Setelah itu kita set selinux = `permissive` dengan mengedit file `/etc/selinux/config` 

```bash
sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config && \
systemctl disable firewalld && \
systemctl stop firewalld
```

Kemudian `reboot` . 

## Installing cri-o as container runtime

Kemudian tahap selanjutnya adalah setting/install container runtime yang di support oleh kubernetes, Pada kasus kali ini kita akan menggunakan [cri-o](https://cri-o.io/).

1. Installing containerd, Download the `containerd-<VERSION>-<OS>-<ARCH>.tar.gz` archive from [github releases](https://github.com/containerd/containerd/releases)
```bash
OS=CentOS_7
VERSION=1.17
curl -L -o /etc/yum.repos.d/devel:kubic:libcontainers:stable.repo https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable/$OS/devel:kubic:libcontainers:stable.repo
curl -L -o /etc/yum.repos.d/devel:kubic:libcontainers:stable:cri-o:$VERSION.repo https://download.opensuse.org/repositories/devel:kubic:libcontainers:stable:cri-o:$VERSION/$OS/devel:kubic:libcontainers:stable:cri-o:$VERSION.repo
yum install -y \
	cri-o \
	containernetworking-plugins \
  containers-common \
  go \
  runc
  
systemctl enable --now crio
```

2. quickly get started running simple pods and containers. Install [crictl](https://github.com/kubernetes-sigs/cri-tools/blob/master/docs/crictl.md)

```bash
VERSION="v1.24.1"
wget https://github.com/kubernetes-sigs/cri-tools/releases/download/$VERSION/crictl-$VERSION-linux-amd64.tar.gz
sudo tar zxvf crictl-$VERSION-linux-amd64.tar.gz -C /usr/local/sbin
rm -f crictl-$VERSION-linux-amd64.tar.gz
```

3. Test cri-o working

```bash
[root@vm-k8s-worker1 go]# crictl info
{
  "status": {
    "conditions": [
      {
        "type": "RuntimeReady",
        "status": true,
        "reason": "",
        "message": ""
      },
      {
        "type": "NetworkReady",
        "status": true,
        "reason": "",
        "message": ""
      }
    ]
  }
}

[root@vm-k8s-worker1 go]# crictl pull docker.io/library/nginx
Image is up to date for docker.io/library/nginx@sha256:10f14ffa93f8dedf1057897b745e5ac72ac5655c299dade0aa434c71557697ea

[root@vm-k8s-worker1 go]# crictl images
IMAGE                     TAG                 IMAGE ID            SIZE
docker.io/library/nginx   latest              55f4b40fe486a       146MB
```

## Forwarding IPv4 and letting iptables see bridged traffic

Make sure that the `br_netfilter` module is loaded. This can be done by running `lsmod | grep br_netfilter`. To load it explicitly call `sudo modprobe br_netfilter`.
As a requirement for your Linux Node’s iptables to correctly see bridged traffic, you should ensure `net.bridge.bridge-nf-call-iptables` is set to 1 in your `sysctl` config, e.g.

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay && lsmod | grep overlay
sudo modprobe br_netfilter && lsmod | grep br_netfilter

# sysctl params required by setup, params persist across reboots
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

# Apply sysctl params without reboot
sudo sysctl --system
```

##  Configuring a cgroup driver for cri-o

CRI-O uses the systemd cgroup driver per default, which is likely to work fine for you. To switch to the cgroupfs cgroup driver, either edit `/etc/crio/crio.conf` or place a drop-in configuration in `/etc/crio/crio.conf.d/02-cgroup-manager.conf`, for example:

```bash
[crio.runtime]
conmon_cgroup = "pod"
cgroup_manager = "cgroupfs"
```

This config option supports live configuration reload to apply this change: `systemctl reload crio` or by sending SIGHUP to the crio process.

## Install Kubernetes CLI

You will install these packages on all of your machines:

1. `kubeadm`: the command to bootstrap the cluster.
2. `kubelet`: the component that runs on all of the machines in your cluster and does things like starting pods and containers. 
3. `kubectl`: the command line util to talk to your cluster.

Kita bisa menggunakan package manager Red Hat-based distribution seperti berikut:

```bash
cat <<EOF | sudo tee /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://packages.cloud.google.com/yum/repos/kubernetes-el7-\$basearch
enabled=1
gpgcheck=1
gpgkey=https://packages.cloud.google.com/yum/doc/yum-key.gpg https://packages.cloud.google.com/yum/doc/rpm-package-key.gpg
exclude=kubelet kubeadm kubectl
EOF

sudo yum install -y kubelet-1.23.* kubeadm-1.23.* kubectl-1.23.* --disableexcludes=kubernetes && \
sudo setenforce 0 && \
sudo systemctl enable --now kubelet
```

## Initial kubernetes cluster

The control-plane node is the machine where the control plane components run, including etcd (the cluster database) and the API Server (which the kubectl command line tool communicates with).

Karena disini saya menggunakan banyak network seperti pada `ip addr show up` berikut:

```bash
ip addr show up
#1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
#    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
#    inet 127.0.0.1/8 scope host lo
#       valid_lft forever preferred_lft forever
#    inet6 ::1/128 scope host
#       valid_lft forever preferred_lft forever
#2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
#    link/ether 08:00:27:82:7e:72 brd ff:ff:ff:ff:ff:ff
#    inet 10.0.2.15/24 brd 10.0.2.255 scope global dynamic noprefixroute enp0s3
#       valid_lft 85608sec preferred_lft 85608sec
#    inet6 fe80::af80:fc40:bb9d:a6a/64 scope link noprefixroute
#       valid_lft forever preferred_lft forever
#3: enp0s8: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
#    link/ether 08:00:27:0b:23:b1 brd ff:ff:ff:ff:ff:ff
#    inet 192.168.88.140/24 brd 192.168.88.255 scope global noprefixroute enp0s8
#       valid_lft forever preferred_lft forever
#    inet6 fe80::7b04:464f:315e:f223/64 scope link dadfailed tentative noprefixroute
#       valid_lft forever preferred_lft forever
#    inet6 fe80::deda:2329:2c79:32a8/64 scope link noprefixroute
#       valid_lft forever preferred_lft forever
#4: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default
#    link/ether 02:42:dd:8a:d8:d6 brd ff:ff:ff:ff:ff:ff
#    inet 172.17.0.1/16 brd 172.17.255.255 scope global docker0
#       valid_lft forever preferred_lft forever
```

Maka saya mau pake IP Address `192.168.xx.xx` maka saya menggunakan network `enp0s8` untuk Network cni `--apiserver-advertise-address`

```bash
export KUBE_NET_INTERFACE=enp0s8 && \
kubeadm config images pull && \
kubeadm init \
--apiserver-advertise-address=$(ip -f inet a show $KUBE_NET_INTERFACE | grep inet | awk '{ print $2 }' | cut -d/ -f1) \
--pod-network-cidr=10.244.0.0/16 && \
mkdir -p $HOME/.kube && \
sudo cp -i /etc/kubernetes/admin.conf ~/.kube/config && \
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Check the kubelet service is running?, troubleshooting:

1. if is error message `failed to get cgroup stats for \"/system.slice/kubelet.service\"` then update/add value `KUBELET_EXTRA_ARGS=--runtime-cgroups=/systemd/system.slice --kubelet-cgroups=/systemd/system.slice` in `/etc/sysconfig/kubelet`
2. make sure cgroup_manager is `cgroupfs` and conmon_cgroup is `pod` on `/ect/crio/crio.conf`, it will failed create container

## Installing Addons Networking and Network Policy

Untuk network plugin and policy, sebetulnya ada banyak implementasinya. bisa di check [disini](https://kubernetes.io/docs/concepts/cluster-administration/addons/) namun di materi kali ini kita akan menggunakan flannel seperti berikut untuk menginstallnya:

```bash
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
```

## Joining Kubernetes Workers node

Untuk multiple nodes, kita bisa join ke master / control panel dengan perintah yang tadi yaitu

```bash
kubeadm join 192.168.88.140:6443 --token 6bo11m.i5517ihphsnuuj67 \
        --discovery-token-ca-cert-hash sha256:9ee47b6f4a02623839c33281a8692ac637f41537913e0baa33b53cddc3647335
```

Or you can create new token

```bash
kubeadm token create --print-join-command
```

## Control plane node isolation (Optional)

By default, your cluster will not schedule Pods on the control-plane node for security reasons. If you want to be able to schedule Pods on the control-plane node, for example for a single-machine Kubernetes cluster for development, run:

```bash
kubectl taint nodes --all node-role.kubernetes.io/master-
```

## Adding a ip address to the Kubernetes API Server Certificate

ref: 
- https://blog.scottlowe.org/2019/07/30/adding-a-name-to-kubernetes-api-server-certificate/
