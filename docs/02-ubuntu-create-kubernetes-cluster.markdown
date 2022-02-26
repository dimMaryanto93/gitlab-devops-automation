# Installing Kubernetes cluster

Kita siapkan host yang akan di install kubernetes, sebagai contoh disini saya menggunakan Ubuntu 20.04.3 dengan konfigurasi minimal sebagai berikut:

```yaml
Master-Node:
    - NodeName: 'k8s-master'
      CPU: '2 Cores' or more.
      RAM: '4 GB' or more
      Storage: '50 GB'
        partision: 
          - / = "20 Gb"
          - /var = "30 Gb"
          - swap = "Disabled"
      Network: # Full network connectivity between all machines in the cluster (public or private network is fine).
        - IP4: 'Brige (192.168.88.140)'
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
apt-get update && apt-get upgrade -y && \
apt-get install -y net-tools \
  curl \
  wget \
  vim \
  tmux \
  apt-transport-https \
  ca-certificates \
  gnupg \
  lsb-release
```

Disable swap partition permanently, edit file `/etc/fstab` comment `/dev/mapper/cl-swap` like this:

```conf
# /etc/fstab: static file system information.
#
# Use 'blkid' to print the universally unique identifier for a
# device; this may be used with UUID= as a more robust way to name devices
# that works even if disks are added and removed. See fstab(5).
#
# <file system> <mount point>   <type>  <options>       <dump>  <pass>
# / was on /dev/ubuntu-vg/ubuntu-lv during curtin installation
/dev/disk/by-id/dm-uuid-LVM-pLKndmSgBkA5Lk8mWuP7bJc9XiABYFegLL5BawnlKjsJ0EPRyGiKIiprV2ZM1FMI / ext4 defaults 0 1
# /boot was on /dev/sda2 during curtin installation
/dev/disk/by-uuid/9306ff44-a2d1-4d49-a7a3-b9278929a3e3 /boot ext4 defaults 0 1
#/swap.img      none    swap    sw      0       0
```

Kemudian `reboot`. 

Setelah itu kita setup untuk networking (iptables) di kubernetes.

Make sure that the `br_netfilter` module is loaded. This can be done by running `lsmod | grep br_netfilter`. To load it explicitly call `sudo modprobe br_netfilter`.
As a requirement for your Linux Node’s iptables to correctly see bridged traffic, you should ensure `net.bridge.bridge-nf-call-iptables` is set to 1 in your `sysctl` config, e.g.

```bash
lsmod | grep br_netfilter && \
sudo modprobe br_netfilter

cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
br_netfilter
EOF

cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF

sudo sysctl --system
```

## Installing docker as kubernetes runtime

Install the `yum-utils` package (which provides the yum-config-manager utility) and set up the stable repository.

```bash
## add docker official gpg key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

## add docker repo
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

## install docker-ce
apt-get update && \
apt-get -y install docker-ce docker-ce-cli containerd.io

## configure daemon
sudo mkdir -p /etc/docker && \
cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2",
  "insecure-registries": [
    "repository.dimas-maryanto.com:8087",
    "repository.dimas-maryanto.com:8086"
  ]
}
EOF
```

Kemudian jalankan service dockernya, dengan perintah seperti berikut:

```bash
systemctl enable --now docker
```

## Install Kubernetes CLI

You will install these packages on all of your machines:

1. `kubeadm`: the command to bootstrap the cluster.
2. `kubelet`: the component that runs on all of the machines in your cluster and does things like starting pods and containers. 
3. `kubectl`: the command line util to talk to your cluster.

Kita bisa menggunakan package manager Debian distribution seperti berikut:

```bash
## add google cloud public signing key
sudo curl -fsSLo /usr/share/keyrings/kubernetes-archive-keyring.gpg https://packages.cloud.google.com/apt/doc/apt-key.gpg


## add kubernetes apt repository
echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list

apt-get update && \
apt-get install -y kubelet kubeadm kubectl && \
apt-mark hold kubelet kubeadm kubectl
```

## Initial kubernetes cluster

The control-plane node is the machine where the control plane components run, including etcd (the cluster database) and the API Server (which the kubectl command line tool communicates with).

Karena disini saya menggunakan banyak network seperti pada `ip addr show up` berikut:

```bash
root@k8s-vm-ubuntu:~# ip a | grep enp
2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    inet 10.0.2.15/24 brd 10.0.2.255 scope global dynamic enp0s3
3: enp0s8: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    inet 192.168.100.48/24 brd 192.168.100.255 scope global dynamic enp0s8
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
