## Install on alicloud

Install csi driver for object storage for Alicloud kubernetes AKS

```bash 
helm install csi-s3 yandex-s3/csi-s3 \
--namespace csi-s3 \
--create-namespace \
--set secret.name=ntnx-s3-secret \
--set storageClass.create=true \
--set storageClass.name=csi-s3 \
--set secret.endpoint='http://bank-muamalat.oss-ap-southeast-5-internal.aliyuncs.com' \
--set storageClass.singleBucket=bank-muamalat
```

## on nutanix

Install cis 

```bash 
helm install csi-s3 yandex-s3/csi-s3 \
--namespace csi-s3 \
--create-namespace \
--set secret.name=ntnx-s3-secret \
--set storageClass.create=true \
--set storageClass.name=csi-s3 \
--set secret.endpoint='http://10.55.22.103' \
--set storageClass.singleBucket=logging-apps
```
