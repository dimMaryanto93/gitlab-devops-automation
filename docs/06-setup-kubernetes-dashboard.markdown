# Installing Kubernetes Dashboard

Create file `dashboard-service-account.yaml` seperti berikut:

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: admin-user
  namespace: kubernetes-dashboard
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: admin-user
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: cluster-admin
subjects:
  - kind: ServiceAccount
    name: admin-user
    namespace: kubernetes-dashboard
```

Kemudian, kita jalankan perintah berikut:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.5.0/aio/deploy/recommended.yaml && \
kubectl apply -f dashboard-service-account.yaml && \
kubectl get secret -n kubernetes-dashboard $(kubectl get serviceaccount admin-user -n kubernetes-dashboard -o jsonpath="{.secrets[0].name}") -o jsonpath="{.data.token}" | base64 --decode
```

You’ll then see an output of a long string of seemingly random characters. Untuk menakses kubernetes Dashboard saya lebih suka menggunakan service. jadi kita edit servicenya dengan perintah berikut:

```bash
kubectl -n kubernetes-dashboard edit service kubernetes-dashboard
```

You should see yaml representation of the service. Change type: ClusterIP to type: NodePort and save file. If it's already changed go to next step.

```yaml
# Please edit the object below. Lines beginning with a '#' will be ignored,
# and an empty file will abort the edit. If an error occurs while saving this file will be
# reopened with the relevant failures.
#
apiVersion: v1
kind: Service
metadata:
  annotations:
    kubectl.kubernetes.io/last-applied-configuration: |
      {"apiVersion":"v1","kind":"Service","metadata":{"annotations":{},"labels":{"k8s-app":"kubernetes-dashboard"},"name":"kubernetes-dashboard","namespace":"kubernetes-dashboard"},"spec":{"ports":[{"port":443,"targetPort":8443}],"selector":{"k8s-app":"kubernetes-dashboard"}}}
  creationTimestamp: "2021-07-22T08:18:38Z"
  labels:
    k8s-app: kubernetes-dashboard
  name: kubernetes-dashboard
  namespace: kubernetes-dashboard
  resourceVersion: "9465"
  uid: be33647d-7305-4013-b95d-d803fbfc7d8a
spec:
  clusterIP: 10.103.180.102
  clusterIPs:
  - 10.103.180.102
  externalTrafficPolicy: Cluster
  ipFamilies:
  - IPv4
  ipFamilyPolicy: SingleStack
  ports:
  - nodePort: 30106
    port: 443
    protocol: TCP
    targetPort: 8443
  selector:
    k8s-app: kubernetes-dashboard
  sessionAffinity: None
  type: NodePort
status:
  loadBalancer: {}
```

Kemudian, untuk mendapatkan nilai portnya gunakan perintah seperti berikut:

```bash
kubectl -n kubernetes-dashboard get service kubernetes-dashboard
```

hasilnya seperti berikut:

```bash
[devops@dev01 ~]$ kubectl -n kubernetes-dashboard get service kubernetes-dashboard
NAME                   TYPE       CLUSTER-IP       EXTERNAL-IP   PORT(S)         AGE
kubernetes-dashboard   NodePort   10.103.180.102   <none>        443:30106/TCP   14m
```

Kemudian coba akses [https://host:port](https://localhost:30106) hasilnya seperti berikut:

![kubernetes-dashboard](images/kubernetes-dashboard/01-dashboard-login.png)

Setelah itu kita bisa masukan token yang telah kita dapatkan tadi kemudian login, maka hasilnya seperti berikut:

![kubernetes-dashboard-login](images/kubernetes-dashboard/02-dashboard-login.png)
