## Prometheus Prerequisites

To use this integration:

1. Prometheus must be installed in your cluster in the gitlab-managed-apps namespace.
2. The Service resource for Prometheus must be named prometheus-prometheus-server.

```bash
# Create the required Kubernetes namespace
kubectl create ns gitlab-managed-apps

# Download Helm chart values that is compatible with the requirements above.
# These are included in the Cluster Management project template.
wget https://gitlab.com/gitlab-org/project-templates/cluster-management/-/raw/master/applications/prometheus/values.yaml

# Add the Prometheus community Helm chart repository
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

# Install Prometheus
helm install prometheus prometheus-community/prometheus -n gitlab-managed-apps --values values.yaml
```

Jika pods `prometheus-server-xxx` statusnya pending karena persistencevolumeclaim, kita edit 

```bash
## edit resource
kubectl edit pv prometheus-prometheus-server -n gitlab-managed-apps
```

Tambahakan propery `spec.volumeName: "prometheus-prometheus-server-pv"`

Kemudian buat PersistenceVolume dengan menjalankan perintah berikut:

```bash
kubectl apply -f .gitlab/prometheus/pv.yaml -n gitlab-managed-apps
```

## Enable Prometheus integration for your cluster

To enable the Prometheus integration for your cluster:

1. Go to the cluster's page:
   1. For a project-level cluster, navigate to your project's
   Infrastructure > Kubernetes clusters.
   2. For a group-level cluster, navigate to your group's
   Kubernetes page.
   3. For an instance-level cluster, navigate to your instance's
   Kubernetes page.
2. Select the Integrations tab.
3. Check the Enable Prometheus integration checkbox.
4. Click Save changes.
5. Go to the Health tab to see your cluster's metrics.

## View monitor

To View the Monitoring your project:

1. Go to project repository -> Menu -> Monitor -> Metrics
2. Select **K8s pod health** -> your environment -> select your **Pod name**

hasilnya seperti berikut:

![metrix-cpu](images/metrixs/prometheus.png)
