## Nutanix Kubernetes Engine

for Nutanix kubernetes engine, this prequisite to create kubernetes cluster on nutanix AHV:

- Setup pre-requirement for enablement NKE (Nutanix Kubernetes Engine)
- Enable Nutanix kubernetes engine
- Install dark web for airgap
- Enable airgap for offline NKE (optional)
- Preparing subnet for Karbon
- Create cluster kubernetes

## Setup pre-requirement for enablement NKE

Untuk membuat kubernetes cluster di Nutanix menggunakan NKE (Nutanix Kubernetes Engine) formally Karbon ada beberapa syarat yang harus dipenuhi diantaranya

- Install Prism Central (PC) on a Nutanix cluster.
Ensure that the configuration of the Prism Element (PE) cluster meets the following specifications:
    - AHV
    - A minimum 120 MB of memory and 700 MB of disk space in PC
- Do the following before deploying NKE:
    - See NKE Software Compatibility in the Nutanix Kubernetes Engine Release Notes for Prism Central (PC) and Prism Element (PE) compatibility requirements.
    - Configure the **cluster virtual IP address** and the **iSCSI data services IP address** on the designated PE cluster.
    - **NTP**, bisa menggunakan public ntp atau menggunakan vm seperti berikut: [How to install & configure ntp on linux](https://www.liquidweb.com/kb/how-to-install-and-configuring-ntp-on-centos-and-ubuntu/)
    - **DHCP server**, bisa menggunakan default router atau jika tidak ada bisa menggunakan vm seperti berikut: [How to install & configure dhcp-server on linux](https://elearningsurasakblog.wordpress.com/2019/09/24/how-to-install-and-configure-dhcp-server-on-centos7/)
- Firewall Requirements, NKE only supports HTTP unauthenticated proxy. Use the IP or the fully qualified domain name (FQDN) format. Ensure that your firewall allows NKE VMs and CVMs to reach the below domains and sub-domains. Also, exclude the following domains from the security-sockets layer (SSL) inspection in the firewall.
    - `*.cloudfront.net`
    - `*.quay.io`
    - `ntnx-portal.s3.amazonaws.com`
    - `portal.nutanix.com`
    - `release-api.nutanix.com`
    - `s3*.amazonaws.com`
    - `*.compute-1.amazonaws.com`

- Node Resource Default Settings

    - Control-Plane (master node)

        | Cluster Type  | vCpu  | Memory (GiB)  | Storage (GiB) | Nodes (vm)    |
        | :---          | :---  | :---          | :---          | :---          |
        | Production    | 8     | 8             | 120           | 2             |
        | Development   | 4     | 4             | 120           | 1             |

    - Etcd (config node)

        | Cluster Type  | vCpu  | Memory (GiB)  | Storage (GiB) | Nodes (vm)    |
        | :---          | :---  | :---          | :---          | :---          |
        | Production    | 4     | 8             | 120           | 3             |
        | Development   | 4     | 4             | 120           | 1             |

    - Worker (worker node)

        | Cluster Type  | vCpu  | Memory (GiB)  | Storage (GiB) | Nodes (vm)    |
        | :---          | :---  | :---          | :---          | :---          |
        | Production    | 8     | 8             | 200           | 3             |
        | Development   | 4     | 4             | 120           | 1             |

- Ip addresses settings

    | Cluster Type  | control-plane | etcd      | worker    | virtual-ip            | Total |
    | :---          | :---          | :---      | :---      | :---                  | :---  |
    | Production    | 2             | 3         | 3         | 1 (diluar ip-pools)   | 9 ip  |  
    | Development   | 1             | 1         | 1         | -                     | 3 ip  |

## Enable Nutanix kubernetes Engine (NKE)

Sebelum meng-enabled Nutanix Kubernetes Engine (NKE) pada menu `services -> Kubernetes` pastikan NKE engine pada LCM sudah running version yang terbaru seperti berikut contohnya:

![lcm-nke-version](images/nutanix-nke/08-lcm-nke-version.png)

Setelah component NKE diupdate ke latest version, sekarang kita bisa enable NKE services nya seperti berikut:

![enable-nke](images/nutanix-nke/02a-enable-karbon.png)

Setelah aktif kita bisa download OS image atau jika tidak ada jaringan internet bisa menggunakan airgap.

## Install darksite using web-server for airgap

Untuk membuat darksite, basicly kita bisa menggunakan lightwight web server seperti `httpd` atau `apache`. Jadi kita perlu siapkan Virtual Machine (VM) linux contohnya seperti Centos 7/8, Oracle Linux 8 dan lain-lain, kita bisa pasang menggunakan repository

```bash
yum install -y httpd
```

Setelah itu kita bisa download dari website [portal nutanix](https://portal.nutanix.com/page/downloads?product=karbon) binnary `NKE Airgap bundle` untuk file `tar.gz` dan `metadata` seperti berikut:

![nke-airgap-download](images/nutanix-nke/01c-download-airgap.png)

Setelah di download kemudian di extract menggunakan command seperti berikut:

```bash
sudo mkdir -p /var/www/html/airgap/ntnx-<version>
tar zxvf airgap-ntnx-<version>.tar.gz -C /var/www/html/airgap/ntnx-<version>
sudo cp airgap-manifest.json /var/www/html/airgap/ntnx-<version>
```

## Enable airgap for offline NKE (optional)

Setelah kita buat darksite yang berisikan binary airgap, sekarang kita akan enable airgap melalui ssh ke cvm (Controller Virtual Machine) setelah itu kita bisa jalankan command `karbonctl airgap enable`. Tetapi sebelum itu kita perlu liahat dulu beberapa requirement untuk mengenable airgap tersebut yaitu:

- Ensure that you **do not have any Kubernetes clusters** deployed.
- Ensure that you **have a managed VLAN**.
- Log on to **Prism Element** and get the following details:
    - Network name (in Network view)
    - Storage container name (in Storage view)
    - Prism Element cluster name (in Home view)

Setelah semuanya terpenuhi kita bisa jalankan perintah berikut:

```bash
cd karbon
./karbonctl login --pc-username <pc-username>
export KARBONCTL_WEBSERVER_URL='http://<webserver-ip>:<webserver-port>/airgap/ntnx-<version>/'
export KARBONCTL_VLAN_NAME='<vlan-name-from-pe>'
export KARBONCTL_STORAGE_CONTAINER_NAME='<storage-container-name-from-pe>'
export KARBONCTL_CLUSTER_UUID='<cluster-uuid-from-pe>'
export KARBONCTL_STATIC_IP='<ip-outsite-ip-pool>'

./karbonctl airgap enable \
--webserver-url=$KARBONCTL_WEBSERVER_URL \
--vlan-name=$KARBONCTL_VLAN_NAME \
--storage-container=$KARBONCTL_STORAGE_CONTAINER_NAME \
--pe-cluster-uuid=$KARBONCTL_CLUSTER_UUID \
--static-ip=$KARBONCTL_STATIC_IP
```

Setelah itu kita bisa lihat hasilnya dengan perintah `karbonctl airgap list` atau pada list vm terdapat virtualmachine baru dengan nama `airgap-n`.

## Preparing subnet for Karbon