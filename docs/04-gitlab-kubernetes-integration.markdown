## How to Integrate Gitlab with Existing kubernetes cluster

Pertama, create project misalnya dengan nama `springboot-gitlab-cicd-k8s-example`. 

## Register kubernetes cluster

Kemudian ke menu `Infrastructure -> Kubernetes cluster -> Integrate with a cluster certificate` seperti berikut:

![integrate-cluster](images/gitlab-integration/01-integrate-cluster.png)

Setelah itu pilih `Connect existing cluster` seperti berikut:

![connect-exist-cluster](images/gitlab-integration/02-connect-existing.png)
 
Kemudian isi fieldnya sesuai dengan kubernetes cluster.

- Kubernetes cluster name: `dev.cluster.k8s.dimas-maryanto.com`
- Environment scope: `*`
- API URL: jalankan perintah `kubectl cluster-info | grep -E 'Kubernetes master|Kubernetes control plane' | awk '/http/ {print $NF}'`
- CA Certificate: cari secret dengan prefix `default-token-xxxxx` menggunakan perintah `kubectl get sercrets`, kemudian ambil menggunakan perintah `kubectl get secret <secret name> -o jsonpath="{['data']['ca\.crt']}" | base64 --decode` or `kubectl get secret $(kubectl get secret | awk '/^default-token/ {print $1}') -o jsonpath="{['data']['ca\.crt']}" | base64 --decode`
- Service Token: jalankan file `kubectl create namespace gitlab-managed-apps && kubectl apply -f .gitlab/gitlab-service-account.yaml`, kemudian ambil tokennya dengan perintah `kubectl -n kube-system describe secret $(kubectl -n kube-system get secret | grep gitlab | awk '{print $1}')`

Jika sudah maka hasilnya, seperti berikut:

![cluster-registered](images/gitlab-integration/03-cluster-registered.png)

Setelah itu set `Settings -> CI/CD -> Variables` seperti berikut:

![cicd-variables](images/gitlab-integration/04-cicd-variables.png)

CI/CD Variables description:

```yaml
- CI_REGISTRY:
    Value: "docker.io" # diisi dengan url docker registry atau insecure registry (hosted)
    Type: "Variable"
    Environtment scope: "All"
- CI_REGISTRY_PULL:
    Value: "docker.io" # diisi dengan url docker registry atau insecure registry (proxy atau group)
    Type: "Variable"
    Environtment scope: "All"
- DOCKER_CONF_JSON:
    Value: "{ auths: { ... }}" # ambil dari file `cat .docker/config.json`
    Type: "File"
    Environtment scope: "All"
- KUBE_CONFIG: 
    Value: "apiVersion: v1 clusters: - cluster:..." # ambil dari file `cat .kube/config`
    Type: "File"
    Environtment scope: "All"
- M2_SETTINGS_XML:
    Value: "<?xml version=\"1.0\" encoding=\"" # jika punya maven repo boleh tambahin di sini, ambil dari file `cat ~/.m2/settings.xml`
    Type: "File"
    Environtment scope: "All"
```

