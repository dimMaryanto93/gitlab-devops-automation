---
title: "01f - Setup private registry using karbonctl"
catalog_key: preparation
categories:
- Nutanix
- PrismCentral
- Karbonctl
refs: []
image_path: /resources/imgs/01d-nexus-oss
gist: 
downloads: []
---

Ow... One more think, The last step is register the insecure registry from Nexus OSS to NKE. Sama halnya dengan kita setting docker insecure-registry barusan jadi kita perlu setup juga insecure-registry untuk NKE supaya bisa pull dari Nexus OSS. Caranya kita login ssh ke Prism Central

```bash
ssh nutanix@10.xx.xx.39
```

Kemudian kita register insecure-registery dengan perintah berikut:

```bash
cd karbon/ && \
./karbonctl login --pc-username admin && \
./karbonctl registry --url 10.12.11.71 --port 8086 --username nke-user --password 'nke-user1234!' --name 'nexus-hpoc' add
```

Jika dijalankan hasilnya seperti berikut:

![nke-registry-registered]({{ page.image_path | prepend: site.baseurl}}/04-nke-registry-registered.png)