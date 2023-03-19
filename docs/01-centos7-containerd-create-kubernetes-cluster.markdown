# Installing Kubernetes cluster

Kita siapkan host yang akan di install kubernetes, sebagai contoh disini saya menggunakan Centos 7 (2009) dengan konfigurasi minimal sebagai berikut:

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
        - IP4: 'Brige (192.168.88.15)'
        - hostname: 'k8s-master.dimas-maryanto.com' # Unique hostname, MAC address, and product_uuid for every node.
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
        - IP4: 'Brige (192.168.88.16)'
        - hostname: 'k8s-worker1.dimas-maryanto.com' # Unique hostname, MAC address, and product_uuid for every node.
    - NodeName: 'k8s-worker2'
      CPU: '2 Cores' or more.
      RAM: '2 GB' or more.
      Storage: '50 GB'
        partision:
          - / = "20 Gb"
          - /var = "30 Gb"
          - swap = "Disabled"
      Network: # Full network connectivity between all machines in the cluster (public or private network is fine).
        - IP4: 'Brige (192.168.88.17)'
        - hostname: 'k8s-worker2.dimas-maryanto.com' # Unique hostname, MAC address, and product_uuid for every node.
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

## Installing containerd as kubernetes runtime

Installing containerd, Download the `containerd-<VERSION>-<OS>-<ARCH>.tar.gz` archive from [github releases](https://github.com/containerd/containerd/releases) , verify its `sha256sum`, and extract it under `/usr/local`:

```bash
tar Cxzvf /usr/local containerd-version.tar.gz
```

If you intend to start containerd via systemd, you should also download the [`containerd.service`](https://raw.githubusercontent.com/containerd/containerd/main/containerd.service) file, and run the following commands:

```bash
mkdir -p /usr/local/lib/systemd/system/ && \
wget -O /usr/local/lib/systemd/system/containerd.service https://raw.githubusercontent.com/containerd/containerd/main/containerd.service
systemctl daemon-reload
systemctl enable --now containerd
```

Download the `runc.<ARCH>` binary from [github releases](https://github.com/opencontainers/runc/releases) , verify its sha256sum, and install it as `/usr/local/sbin/runc`

```bash
wget https://github.com/opencontainers/runc/releases/download/v1.1.3/runc.amd64 && \
install -m 755 runc.amd64 /usr/local/sbin/runc
```

Installing CNI plugins, Download the `cni-plugins-<OS>-<ARCH>-<VERSION>.tgz` archive from [github releases](https://github.com/containernetworking/plugins/releases) , verify its `sha256sum`, and extract it under `/opt/cni/bin`:

```bash
mkdir -p /opt/cni/bin && \
tar Cxzvf /opt/cni/bin cni-plugin-version.tgz
```

Installing nerdctl, for debug your container you need containerd client such as `nerdctl` but also you can used build-in `ctr`. Download the `nerdctl-<OS>-<ARCH>-<VERSION>.tar.gz` archive from [github release](https://github.com/containerd/nerdctl/releases)

```bash
wget https://github.com/containerd/nerdctl/releases/download/v0.21.0/nerdctl-0.21.0-linux-amd64.tar.gz && \
tar Cxzvf /usr/local/bin nerdctl-0.21.0-linux-amd64.tar.gz
```

Sekarang kita coba test containerd sudah jalan dengan perintah seperti berikut:

```bash
root@k8s-master:~# nerdctl run -d -p 80 nginx:mainline
c55f7519066aa7aee187f216570709b5cd3ec760b5e59245b13d7e2391bef55f

root@k8s-master:~# nerdctl container ls
CONTAINER ID    IMAGE                               COMMAND                   CREATED          STATUS    PORTS                    NAMES
c55f7519066a    docker.io/library/nginx:mainline    "/docker-entrypoint.…"    9 seconds ago    Up        0.0.0.0:49153->80/tcp    nginx-c55f7

root@k8s-master:~# nerdctl port nginx-c55f7
80/tcp -> 0.0.0.0:49153

root@k8s-master:~# curl -v localhost:49153
*   Trying 127.0.0.1:49153...
* Connected to localhost (127.0.0.1) port 49153 (#0)
> GET / HTTP/1.1
> Host: localhost:49153
> User-Agent: curl/7.81.0
> Accept: */*
> 
* Mark bundle as not supporting multiuse
< HTTP/1.1 200 OK
< Server: nginx/1.23.0
< Date: Sat, 02 Jul 2022 01:31:09 GMT
< Content-Type: text/html
< Content-Length: 615
< Last-Modified: Tue, 21 Jun 2022 14:25:37 GMT
< Connection: keep-alive
< ETag: "62b1d4e1-267"
< Accept-Ranges: bytes
```

## Kubernetes CRI runtime for containerd

This section outlines the necessary steps to use containerd as CRI runtime.


Make sure that the `br_netfilter` module is loaded. This can be done by running `lsmod | grep br_netfilter`. To load it explicitly call `sudo modprobe br_netfilter`.
As a requirement for your Linux Node’s iptables to correctly see bridged traffic, you should ensure `net.bridge.bridge-nf-call-iptables` is set to 1 in your `sysctl` config, e.g.

```bash
cat <<EOF | sudo tee /etc/modules-load.d/containerd.conf
overlay
br_netfilter
EOF

sudo modprobe br_netfilter && lsmod | grep br_netfilter
sudo modprobe overlay && lsmod | grep overlay

# Setup required sysctl params, these persist across reboots.
cat <<EOF | sudo tee /etc/sysctl.d/99-kubernetes-cri.conf
net.bridge.bridge-nf-call-iptables  = 1
net.ipv4.ip_forward                 = 1
net.bridge.bridge-nf-call-ip6tables = 1
EOF

sudo sysctl --system
```

Get the `config.toml` of containerd configuration then store in `/etc/containerd/config.toml` using this command:

```bash
mkdir -p /etc/containerd && \
containerd config default | tee /etc/containerd/config.toml
```

At the end of this section in `/etc/containerd/config.toml` edit property `SystemCgroup = false` to `true` inside section `[plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]`


Then finally add arguments `--config` if not exists in `/usr/local/lib/systemd/system/containerd.service` like this:

```service
[Service]
ExecStartPre=-/sbin/modprobe overlay
ExecStart=/usr/local/bin/containerd --config=/etc/containerd/config.toml
```

Then reload and restart the service with this command:

```bash
systemctl daemon-reload && \
systemctl restart containerd && \
systemctl status containerd ## make sure this status is running  then you good to go!
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
apt-get install -y kubelet=1.23.* kubeadm=1.23.* kubectl=1.23.* && \
apt-mark hold kubelet kubeadm kubectl
```
