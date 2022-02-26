## metrics-server 

Enable [metrics-server](https://github.com/kubernetes-sigs/metrics-server) for auto scale horizontal/vertical pod scaler. Metrics Server can be installed either directly from YAML manifest or via the official [Helm chart](https://artifacthub.io/packages/helm/metrics-server/metrics-server). To install the latest Metrics Server release from the components.yaml manifest, run the following command.

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### Configuration

Depending on your cluster setup, you may also need to change flags passed to the Metrics Server container. Most useful flags:

1. `--kubelet-preferred-address-types` - The priority of node address types used when determining an address for connecting to a particular node (default [Hostname,InternalDNS,InternalIP,ExternalDNS,ExternalIP])
2. `--kubelet-insecure-tls` - Do not verify the CA of serving certificates presented by Kubelets. For testing purposes only.
3. `--requestheader-client-ca-file` - Specify a root certificate bundle for verifying client certificates on incoming requests.

If pods `metrics-server-xxx` is pending because you should ignore secure tls using command:

```bash
[root@vm1 ~]# kubectl get deploy -n kube-system
NAME             READY   UP-TO-DATE   AVAILABLE   AGE
coredns          2/2     2            2           5m32s
metrics-server   0/1     1            0           113s

## add `--kubelet-insecure-tls` args in spec.template.spec.container.args using this command

kubectl edit deploy/metrics-server -n kube-system

## look like this
spec:
  replicas: 1
  template:
    spec:
      containers:
      - args:
        - --cert-dir=/tmp
        - --secure-port=4443
        - --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname
        - --kubelet-use-node-status-port
        - --kubelet-insecure-tls
        - --metric-resolution=15s

## after word, this the result
[root@vm1 ~]# kubectl get deploy -n kube-system
NAME             READY   UP-TO-DATE   AVAILABLE   AGE
coredns          2/2     2            2           9m8s
metrics-server   1/1     1            1           5m29s
```