---
title: "01a - PreCheck & Update Cluster HPOC"
date: 2024-03-09T15:01:48+07:00
catalog_key: preparation
categories:
- Nutanix
- Cluster
- HPOC
refs: []
image_path: /resources/imgs/01a-hpoc-cluster
gist: 
downloads: []
---

Setelah kita mendapatkan Cluster HPOC, pertama kita perlu check dulu version dari Prism Element dan Prism Central berserta componentnya.

## Prism Element

Ada beberapa precheck pada prism element diantaranya:

- AHV & AOS Version
- Cluster resource (CPUs & Memory)
- LCM Update

Untuk AHV version kita bisa check di Web Prism Element dengan ip [https://10.xx.xxx.37:9443]() seperti berikut:

![prism-element-dashboard]({{ page.image_path | prepend: site.baseurl}}/01-prism-element.png)

Untuk melihat version AOS, kita ke menu [Settings]() kemudian [Upgrade Software]() seperti berikut: 

![prism-element-aos-version]({{ page.image_path | prepend: site.baseurl}}/01-aos-version.png)

Yang perlu kita perhatikan disini, saat ini:

```yaml
version:
    AHV: 20220304.480
    AOS: 6.5.5.5 LTS
resources:
    node: 1
    block: 1
    cpus: 92 GHZ
    memory: 512 GiB
```

Finaly yang terkahir jangan lupa untuk upgrade component Prism Element menggunakan LCM seperti berikut:

![lcm-update-pe]({{ page.image_path | prepend: site.baseurl}}/01a-pe-lcm.png)

## Prism Central

Ada beberapa pre-checked yang harus dilakukan pada Prism Element diantaranya:

- Version of Prism Central
- Networking / Subnet
- Enablement service
- Version of components

Untuk version dari Prism Central kita bisa liat dari menu [Settings]() -> [Prism Central Management]() seperti berikut:

![prism-central-management]({{ page.image_path | prepend: site.baseurl}}/02-prism-central.png)

Disini rekomendasi kita membutuhkan Prism Central `v2022.6.0.10` atau lebih baru, sehingga component NKE, Object storage bisa update ke latest juga.

### Networking

Untuk networking pada umumnya dalam 1 cluster terdapat 2 subnet yaitu Primary dan Secondary. seperti berikut sesuai dengan email dari `automation@nutanix.com`

```ini
NETWORK INFORMATION

Network IP Address / Prefix Length: 10.42.168.0/25
Gateway IP Address: 10.xx.xx.1
Nameserver IP: 10.xx.xx.10
Subnet Mask: 255.255.255.128
Address Range: 10.xx.xx.1 - 10.xx.xx.126

Note: "Address Range" is here to simply save you a trip to a subnet calculator. Please be sure to pay attention to any IP reservations that may be used by products and VMs when assigning an IPAM range in Prism or static IPs to VMs. 
SECONDARY NETWORK INFORMATION

Secondary VLAN: 1681
Secondary Subnet: 255.255.255.128
Secondary Gateway: 10.xx.xx.129
Secondary IP Range: 10.xx.xx.132 - 10.xx.xx.250
```

Jadi untuk **Secondary** subnet kita akan gunakan **NKE cluster** maka kita perlu adjust untuk subnet existing pada menu [Networking & Security]() -> [Subnet]() kemudian klick [Secondary]() seperti berikut:

![subnet-detail]({{ page.image_path | prepend: site.baseurl}}/03-subnet-secondary.png)

Selanjutnya kita klick [Update](), dengan specifikasi seperti berikut:

```yaml
VLAN_ID: xxx
IPAddressManagement: checklist
Networks:
    NetworkIPPrefix: '10.xx.xx.128/25' # sesuaikan dengan secondary subnet
    NetworkIPGateway: '10.xx.xx.129' # sesuaikan dengan secondary gateway
    DomainNameServers: 8.8.8.8, 10.42.194.10 # sesuaikan dengan name server ip
IPAddressPools:
    - start: '10.xx.xx.150'
      end: '10.xx.xx.250'
```

Kurang lebih seperti berikut:

![subnet-updated]({{ page.image_path | prepend: site.baseurl}}/03a-subnet-update.png)

Kemudian di [Save]() hasilnya seperti berikut:

![subnet-result]({{ page.image_path | prepend: site.baseurl}}/03b-subnet-result.png)

### Enablement Service

Makesure untuk temen-temen meng-enable service

- Kubernetes
- Objects
- Files

### Update Components

Setelah pre-requirement service di enable, sekarang kita perlu update component-component tersebut dari LCM Prism Central. Kita bisa akses dari menu [Administration]() -> [LCM]() kemudian kita lakukan [Inventory]() untuk scanning component jika sudah lakukan [Update Software]() sehingga component already up to date seperti berikut:

![lcm-update-pc]({{ page.image_path | prepend: site.baseurl}}/02a-pc-lcm.png)