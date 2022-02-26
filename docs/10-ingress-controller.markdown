In order for the Ingress resource to work, the cluster must have an ingress controller running.

[ingress-nginx](https://github.com/kubernetes/ingress-nginx) is an Ingress controller for Kubernetes using NGINX as a reverse proxy and load balancer.

This section is applicable to Kubernetes clusters deployed on bare metal servers, as well as "raw" VMs where Kubernetes was installed manually, using generic Linux distros (like CentOS, Ubuntu...)

For quick testing, you can use a [NodePort](https://kubernetes.io/docs/concepts/services-networking/service/#type-nodeport). This should work on almost every cluster, but it will typically use a port in the range 30000-32767.

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.1/deploy/static/provider/baremetal/deploy.yaml
```

Now we can check service port run at using command:

```bash
[root@vm1 ~]# kubectl get svc -n ingress-nginx
NAME                                 TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)                      AGE
ingress-nginx-controller             NodePort    10.99.206.95    <none>        80:30886/TCP,443:30590/TCP   3m10s
ingress-nginx-controller-admission   ClusterIP   10.101.46.178   <none>        443/TCP                      3m10s

[root@vm1 ~]# curl -D- localhost:30886
HTTP/1.1 404 Not Found
Date: Wed, 23 Feb 2022 06:08:30 GMT
Content-Type: text/html
Content-Length: 146
Connection: keep-alive

<html>
<head><title>404 Not Found</title></head>
<body>
<center><h1>404 Not Found</h1></center>
<hr><center>nginx</center>
</body>
</html>
```

For testing perpose, we can deploy 2 container then mapped to `/web1` and `/web2` using this command:

```bash
kubectl apply -f https://gist.githubusercontent.com/dimMaryanto93/a3a01b83910cf07914935a25a62d30ce/raw/1fa9b1bae3248f3e8b622314264c3677f1b5b2fd/02f-minikube-ingress.yaml

[root@vm1 ~]# kubectl get ing
NAME             CLASS    HOSTS                ADDRESS   PORTS   AGE
webapp-ingress   <none>   nginx.example.info             80      30s

[root@vm1 ~]# curl -D- -H "Host: nginx.example.info" localhost:30886/web1
HTTP/1.1 200 OK
Date: Wed, 23 Feb 2022 06:11:19 GMT
Content-Type: text/html
Content-Length: 615
Connection: keep-alive
Last-Modified: Tue, 25 Jan 2022 15:03:52 GMT
ETag: "61f01158-267"
Accept-Ranges: bytes

<!DOCTYPE html>
<html>
<head>
<title>Welcome to nginx!</title>
<style>
html { color-scheme: light dark; }
body { width: 35em; margin: 0 auto;
font-family: Tahoma, Verdana, Arial, sans-serif; }
</style>
</head>
<body>
<h1>Welcome to nginx!</h1>
<p>If you see this page, the nginx web server is successfully installed and
working. Further configuration is required.</p>

<p>For online documentation and support please refer to
<a href="http://nginx.org/">nginx.org</a>.<br/>
Commercial support is available at
<a href="http://nginx.com/">nginx.com</a>.</p>

<p><em>Thank you for using nginx.</em></p>
</body>
</html>
```
