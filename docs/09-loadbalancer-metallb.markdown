## Install loadbalancer using metallb

[MetalLB](https://metallb.universe.tf/concepts/) hooks into your Kubernetes cluster, and provides a network load-balancer implementation. In short, it allows you to create Kubernetes services of type LoadBalancer in clusters that don’t run on a cloud provider, and thus cannot simply hook into paid products to provide load balancers.

If you are trying to automate this change, these shell snippets may help you:

```bash
# actually apply the changes, returns nonzero returncode on errors only
kubectl get configmap kube-proxy -n kube-system -o yaml | \
sed -e "s/strictARP: false/strictARP: true/" | \
kubectl apply -f - -n kube-system
```

To install MetalLB, apply the manifest:

```bash
kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.7/config/manifests/metallb-native.yaml
```

This will deploy MetalLB to your cluster, under the metallb-system namespace. The components in the manifest are:

1. The metallb-system/controller deployment. This is the cluster-wide controller that handles IP address assignments.
2. The metallb-system/speaker daemonset. This is the component that speaks the protocol(s) of your choice to make the services reachable.
3. Service accounts for the controller and speaker, along with the RBAC permissions that the components need to function.

## Configuration

MetalLB remains idle until configured. This is accomplished by creating and deploying a config map into the same namespace (metallb-system) as the deployment.

There is an example config map in [manifests/example-config.yaml](https://metallb.universe.tf/configuration/), annotated with explanatory comments.

```yaml
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: microtik-ip-pool
  namespace: metallb-system
spec:
  addresses:
  - 192.168.88.11-192.168.88.25
```

Save as `metallb-config.yaml` then `kubectl apply -f metallb-config.yaml`