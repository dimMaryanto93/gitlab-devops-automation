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
kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml && \
kubectl apply -f dashboard-service-account.yaml && \
kubectl -n kubernetes-dashboard create token admin-user
```

You’ll then see an output of a long string of seemingly random characters. 

`eyJhbGciOiJSUzI1NiIsImtpZCI6Ikt2d2NKWXhlQmcwVzZWdl81NXY1dWhDSGFuX2tURG5BNlk2ODhNOTdza1EifQ.eyJhdWQiOlsiaHR0cHM6Ly9rdWJlcm5ldGVzLmRlZmF1bHQuc3ZjLmNsdXN0ZXIubG9jYWwiXSwiZXhwIjoxNjc5MjQyNzI1LCJpYXQiOjE2NzkyMzkxMjUsImlzcyI6Imh0dHBzOi8va3ViZXJuZXRlcy5kZWZhdWx0LnN2Yy5jbHVzdGVyLmxvY2FsIiwia3ViZXJuZXRlcy5pbyI6eyJuYW1lc3BhY2UiOiJrdWJlcm5ldGVzLWRhc2hib2FyZCIsInNlcnZpY2VhY2NvdW50Ijp7Im5hbWUiOiJhZG1pbi11c2VyIiwidWlkIjoiYTQzYjI2MzQtOTY2YS00Y2Y5LThjZmYtN2YxZmM2YmY4ZTY1In19LCJuYmYiOjE2NzkyMzkxMjUsInN1YiI6InN5c3RlbTpzZXJ2aWNlYWNjb3VudDprdWJlcm5ldGVzLWRhc2hib2FyZDphZG1pbi11c2VyIn0.qWmbhIQSVNCGcumDyoCtJ6d-vAbPPxAs1QFuU12nCz-7S40n_nIsTLr01CCj2s-vrwSkcZArp4EZzVqGo9BRfEjpgdr8XI7HN0v5vE2T6fJbNAmNp026Vv-ewCDsvfUivntCcrPzEK-MGtME0J4oNJiEQ82qQJGJKwaFMh6lLlOmHXP0_cQtyjAfGRhwrOBSiC-hmF4Ol-WbBrby0-_8dFadMxWrRd1WvZIEPwqKbP6IXQUVXdotMWY6VQZNEbXtlTxBJaWNvkaUGcanwdf1n7-L_oTf_vLyyc7dzywg-0pu5GadDzhsScF0xE-3jQ4yPHIXy9JdKjcpQPEwGuILng`

Untuk meng-akses kubernetes Dashboard saya lebih suka menggunakan network NodePort. jadi kita edit servicenya dengan perintah berikut:

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
