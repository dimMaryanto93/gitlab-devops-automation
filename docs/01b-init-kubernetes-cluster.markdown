## Initial kubernetes cluster

The control-plane node is the machine where the control plane components run, including etcd (the cluster database) and the API Server (which the kubectl command line tool communicates with).

Karena disini saya menggunakan banyak network seperti pada `ip addr show up` berikut:

```bash
root@k8s-master:~# ip a | grep enp
    altname enp0s18
```

Maka saya mau pake IP Address `192.168.xx.xx` maka saya menggunakan network `enp0s18` untuk Network cni `--apiserver-advertise-address`

```bash
export KUBE_NET_INTERFACE=enp0s18 && \
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
