---
title: "01d - Install & Configure Nexus OSS as Container Registry"
date: 2024-03-09T21:33:32+07:00
catalog_key: preparation
categories:
- Nutanix
- Container
- Registry
- NexusOSS
refs: []
image_path: /resources/imgs/01d-nexus-oss
gist: 
downloads: []
---

The an other way for storing/accessing container image can be accessed locally is using Nexus OSS, The installation i'll cover is:

1. Deploying VM to using Nexus OSS
2. Installing Nexus OSS
3. Setup Container registry
4. Setup authentication
5. Setup NKE private registry

## Deploying VM to using Nexus OSS

Pertama kita buat dulu sebuah VM dengan specifikasi seperti berikut:

```yaml
name: nke-ops-nexus-oss
description: Nexus OSS for storing container image
resources: 
    CPUs: 2
    CoresPerCPU: 2
    Memory: 8
disks:
    - type: Disk
      operation: Clone from Image
      image: centos7-2207-2.disk # select vm template we created before
      capacity: 500 GiB
      busType: SCSI
networks:
    subnet: Primary
    assignmentType: Assign Static IP
    ipAddress: 10.xx.xx.71
bootConfiguration:
    mode: Legacy BIOS Mode
    bootPriority: Default
categories:
    - AppFamily:DevOps
```

Jadi seperti berikut:

![vm-nexus-oss]({{ page.image_path | prepend: site.baseurl}}/01-create-vm.png)

Kemudian coba nyalakan vm tersebut, dan login menggunakan user: `root` pass: `passwordnyaAdmin` seperti berikut:

![login-vm]({{ page.image_path | prepend: site.baseurl}}/01a-login-ssh.png)

Kemudian kita update disknya, karena kita buat virtual disk `500 GiB` tetapi secara logical masih default image yaitu `50 GiB` seperti berikut:

```bash
[root@nke-ops-nexus-oss ~]# df -h | grep \root
/dev/mapper/centos-root   46G  1.7G   44G   4% /
```

Maka kita harus update lvm disknya dengan menggunakan perintah berikut:

```bash
[root@nke-ops-nexus-oss ~]# fdisk -l

Disk /dev/sda: 536.9 GB, 536870912000 bytes, 1048576000 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 1048576 bytes
Disk label type: dos
Disk identifier: 0x000c0828

   Device Boot      Start         End      Blocks   Id  System
/dev/sda1   *        2048     2099199     1048576   83  Linux
/dev/sda2         2099200   104857599    51379200   8e  Linux LVM

Disk /dev/mapper/centos-root: 48.4 GB, 48444211200 bytes, 94617600 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 1048576 bytes


Disk /dev/mapper/centos-swap: 4160 MB, 4160749568 bytes, 8126464 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 1048576 bytes

[root@nke-ops-nexus-oss ~]# fdisk /dev/sda

Command (m for help): n # type n for new partision
Partition type:
   p   primary (2 primary, 0 extended, 2 free)
   e   extended
Select (default p): p # type p for primary
Partition number (3,4, default 3): # hit enter for default value
First sector (104857600-1048575999, default 104857600): # hit enter for default value
Using default value 104857600
Last sector, +sectors or +size{K,M,G} (104857600-1048575999, default 1048575999):
Using default value 1048575999
Partition 3 of type Linux and of size 450 GiB is set

Command (m for help): w # type w for write disk
The partition table has been altered!

[root@nke-ops-nexus-oss ~]# fdisk -l

Disk /dev/sda: 536.9 GB, 536870912000 bytes, 1048576000 sectors
Units = sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 4096 bytes
I/O size (minimum/optimal): 4096 bytes / 1048576 bytes
Disk label type: dos
Disk identifier: 0x000c0828

   Device Boot      Start         End      Blocks   Id  System
/dev/sda1   *        2048     2099199     1048576   83  Linux
/dev/sda2         2099200   104857599    51379200   8e  Linux LVM
/dev/sda3       104857600  1048575999   471859200   83  Linux ## new partision was created then reboot

[root@nke-ops-nexus-oss ~]# reboot
Connection to 10.12.11.71 closed by remote host.
Connection to 10.12.11.71 closed.

## login back
ssh root@10.12.11.71
root@10.12.11.71 password: # enter root password
## create pvc
[root@nke-ops-nexus-oss ~]# pvcreate /dev/sda3
  Physical volume "/dev/sda3" successfully created.

## create vg
[root@nke-ops-nexus-oss ~]# vgcreate centos_ext /dev/sda3
  Volume group "centos_ext" successfully created

## check list vg
[root@nke-ops-nexus-oss ~]# vgs
  VG         #PV #LV #SN Attr   VSize    VFree
  centos       1   2   0 wz--n-  <49.00g    4.00m
  centos_ext   1   0   0 wz--n- <450.00g <450.00g

## merge new vg into the existing one
[root@nke-ops-nexus-oss ~]# vgmerge centos centos_ext
  Volume group "centos_ext" successfully merged into "centos"

## extend logical volume
[root@nke-ops-nexus-oss ~]# lvextend -l 100%FREE /dev/mapper/centos-root
  Size of logical volume centos/root changed from <45.12 GiB (11550 extents) to 450.00 GiB (115200 extents).
  Logical volume centos/root successfully resized.

## apply logical volume
[root@nke-ops-nexus-oss ~]# xfs_growfs /dev/mapper/centos-root
meta-data=/dev/mapper/centos-root isize=512    agcount=4, agsize=2956800 blks
         =                       sectsz=4096  attr=2, projid32bit=1
         =                       crc=1        finobt=0 spinodes=0
data     =                       bsize=4096   blocks=11827200, imaxpct=25
         =                       sunit=0      swidth=0 blks
naming   =version 2              bsize=4096   ascii-ci=0 ftype=1
log      =internal               bsize=4096   blocks=5775, version=2
         =                       sectsz=4096  sunit=1 blks, lazy-count=1
realtime =none                   extsz=4096   blocks=0, rtextents=0
data blocks changed from 11827200 to 117964800

## check disk 
[root@nke-ops-nexus-oss ~]# df -h | grep \root
/dev/mapper/centos-root  450G  1.7G  449G   1% /
```

## Installing Nexus OSS

Untuk installasi Nexus OSS kita membutuhkan Java Development Kit `v1.8` (JDK 8), kita bisa menginsall menggunakan `openjdk-8` seperti berikut:

```bash
yum install -y java-1.8.0-openjdk
```

Kemudian kita download binary `nexus-oss` dari [official websitenya](https://www.sonatype.com/download-oss-sonatype) atau menggunakan command seperti berikut:

```bash
mkdir -p Downloads && \
wget 'https://download.sonatype.com/nexus/3/latest-unix.tar.gz' -O Downloads/nexus-latest.tar.gz && \
mkdir -p /opt/nexus && \
tar -zxvf Downloads/nexus-latest.tar.gz -C /opt/nexus
```

Setelah selesai buat user `nexus` dan asign folder `/opt/nexus` menjadi milik `nexus` dengan perintah berikut:

```bash
adduser nexus && \
chown -R nexus:nexus /opt/nexus/** && \
chmod -R 777 /opt/nexus/**
```

Kita buat symlink untuk binary `nexus` dengan menggunakan perintah berikut:

```bash
cd /opt/nexus && \
ln -s nexus-<version>/bin/nexus nexus
```

Kemudian kita buat service file dengan nama `nexus.service` di folder `/etc/systemd/system` seperti berikut:

```ini
[Unit]
Description=nexus service
After=network.target

[Service]
Type=forking
ExecStart=/opt/nexus/nexus start
ExecStop=/opt/nexus/nexus stop
LimitNOFILE=65536
User=nexus
Restart=on-abort

[Install]
WantedBy=multi-user.target
```

Kemudian quit & exit, setelah itu kita bisa jalankan perintah berikut:

```bash
systemctl daemon-reload && \
systemctl enable --now nexus
```

Dan finaly open the firewall dengan perintah berikut:

```bash
firewall-cmd --zone=public --permanent --add-port=8081/tcp --add-port=8086/tcp --add-port=8087/tcp && \
firewall-cmd --reload
```

Setelah itu temen-temen bisa check lognya dengan perintah `tail -f /opt/nexus/sonatype-work/nexus3/log/nexus.log` dan muncul output seperti berikut:

```bash
[root@nke-ops-nexus-oss ~]# tail -f /opt/nexus/sonatype-work/nexus3/log/nexus.log
2024-03-09 16:17:31,238+0700 INFO  [jetty-main-1]  *SYSTEM org.sonatype.nexus.repository.httpbridge.internal.ViewServlet - Initialized
2024-03-09 16:17:31,269+0700 INFO  [jetty-main-1]  *SYSTEM org.eclipse.jetty.server.handler.ContextHandler - Started o.e.j.w.WebAppContext@5ecf7810{Sonatype Nexus,/,file:///opt/nexus/nexus-3.66.0-02/public/,AVAILABLE}
2024-03-09 16:17:31,313+0700 INFO  [jetty-main-1]  *SYSTEM org.eclipse.jetty.server.AbstractConnector - Started ServerConnector@845ee27{HTTP/1.1, (http/1.1)}{0.0.0.0:8081}
2024-03-09 16:17:31,313+0700 INFO  [jetty-main-1]  *SYSTEM org.eclipse.jetty.server.Server - Started @39189ms
2024-03-09 16:17:31,314+0700 INFO  [jetty-main-1]  *SYSTEM org.sonatype.nexus.bootstrap.jetty.JettyServer -
-------------------------------------------------
Started Sonatype Nexus OSS 3.66.0-02
-------------------------------------------------
```

Maka nexus-oss bisa di akses di browser dengan menggunakan alamat [http://[ip-address]:8081]() seperti berikut:

![nexus-oss]({{ page.image_path | prepend: site.baseurl}}/02-access-nexus-oss.png)

## Setup Container registry

Untuk membuat registry di nexus kita perlu login dulu sebagai Administrator, secara default user `admin` passwordnya by default di simpan pada file yang lokasinya di `/<path-install>/sonarworks/nexus3/initial_password`. setelah itu pilih Setting seperti berikut:

![settings]({{ page.image_path | prepend: site.baseurl }}/02a-nexus-admin-login.png)

Setelah itu kita akan membuat repository, Ada 3 tipe repository

1. Proxy, digunakan sebagai mirror registry dari public atau private registry lain. 
2. Hosted, digunakan untuk menyimpan image yang kita publish/push
3. Group, digunakan untuk mengelompokan proxy dan hosted registry.

Pertama kita buat dulu proxy registry. Dengan cara seperti berikut:

[Create new repository]() -> [docker (proxy)]() Kemudian isi form seperti specifikasi berikut:

```yaml
name: docker-registry-io
repositoryConnectors:
  http: blank
  https: blank
  allowAnonymousDockerPull: checked
dockerRegistryApi:
  enableDockerV1API: checked
proxy:
  remoteStorage: 
    url: https://registry-1.docker.io
    dockerIndex: Use Docker Hub
storage:
  blobStorage: default
```

Seperti berikut:

![repo-docker-proxy]({{ page.image_path | prepend: site.baseurl}}/02b-docker-reg-proxy.png)

Kemudian klick [Create repository](). 

Setelah itu, kita setup untuk menyimpan image yang kita miliki ke private-registry dengan menggunakan docker (hosted). Dengan cara seperti berikut:

[Create new repository]() -> [docker (hosted)]() Kemudian isi form seperti specifikasi berikut:

```yaml
name: docker-hosted
repositoryConnectors:
  http: checked [8087]
  https: blank
  allowAnonymousDockerPull: checked
dockerRegistryApi:
  enableDockerV1API: checked
storage:
  blobStorage: default
hosted:
  deploymentPolicy: Allow redeploy
```

Seperti berikut:

![repo-docker-hosted]({{ page.image_path | prepend: site.baseurl}}/02c-docker-reg-hosted.png)

Kemudian klik [Create repository](). Dan yang terakhir kita buat group repository docker dengan tujuan mengkases ke-2 registry yang telah kita buat dalam satu port connection saja dengan spesifikasi seperti berikut:

```yaml
name: docker-group
repositoryConnectors:
  http: checked [8086]
  https: blank
  allowAnonymousDockerPull: checked
dockerRegistryApi:
  enableDockerV1API: unchecked
storage:
  blobStorage: default
group:
  members: [docker-registry-io, docker-hosted]
```

Seperti berikut:

![repo-docker-group]({{ page.image_path | prepend: site.baseurl}}/02d-docker-reg-group.png) Kemudian klik [Create repository]().

## Setup authentication

Setelah kita setup registry untuk container image, by default kita belum bisa akses registrynya tanpa authentication sekarang kita akan setup Auth Docker. Kita ke menu [Realms]() kemudian include `Docker Realms` ke aktif seperti berikut:

![realms-docker-active]({{ page.image_path | prepend: site.baseurl}}/03-docker-realms-active.png)

Setelah itu kita perlu set Roles specifik untuk NKE yang hanya bisa pull container image dari nexus caranya kita akses menu [Roles]() kemudian kita [Create role]() dengan spesifikasi seperti berikut:

```yaml
type: Nexus Role
roleId: nx-only-docker-pull
roleName: Nexus Docker Pull only
appliedPrivilages:
  - nx-repository-admin-docker-docker-group-read
  - nx-repository-admin-docker-docker-hosted-browse
  - nx-repository-admin-docker-docker-hosted-read
  - nx-repository-view-docker-*-browse
```

Seperti berikut:

![new-role]({{ page.image_path | prepend: site.baseurl}}/03a-nexus-nke-role.png)

Kemudian di [Save](), Setelah itu kita create user baru dengan cara klick menu [Users]() -> [Create local user]() dengan spesifikasi seperti berikut:

```yaml
userId: nke-user
firstName: nke
lastName: Nutanix Kubernetes
email: nke@nutanix.local
password: nke-user1234!
status: active
roles: ['nx-anonymous', 'nexus-docker-pull-only']
```

Seperti berikut:

![new-user]({{ page.image_path | prepend: site.baseurl}}/03b-nexus-nke-user.png)

Jika sudah sekarang kita test, dengan menggukan docker. So kita install docker pada vm nexus. Maka kita login menggunakan ssh dan install menggunakan perintah berikut:

```bash
sudo yum install -y yum-utils && \
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo && \
sudo yum -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin && \
systemctl enable --now docker && \
firewall-cmd --zone=public --add-masquerade --permanent && \
firewall-cmd --zone=public --add-port=2375/tcp --permanent && \
firewall-cmd --reload
```

Setelah kita install, sekarang kita tambahkan config `insecure-registries` pada docker engine dengan membuat file `/etc/docker/daemon.json` dengan spesifikasi seperti berikut:

```json
{
  "registry-mirrors": [],
  "insecure-registries": [
    "10.12.11.71:8087",
    "10.12.11.71:8086"
  ],
  "debug": false,
  "experimental": false,
  "features": {
    "buildkit": true
  }
}
```

Kemudian [Save & Quit]() dan restart service docker menggunakan perintah berikut:

```bash
systemctl restart docker && \
docker info
```

Makesure ip insecure-registries yang kita tambahkan pada file tersebut sudah muncul pada perintah `docker info`. Jika sudah Ok sekarang kita login menggunakan nexus registry perintahnya berikut:

```bash
docker login -u nke-user 10.12.11.71:8086
```

Setelah itu kita bisa coba pull container image `nginx:mainline` dengan perintah berikut:

```bash
docker pull 10.12.11.71:8086/nginx:mainline
```

Jika dijalankan hasilnya seperti berikut:

![docker-pull-insecure]({{ page.image_path | prepend: site.baseurl}}/03c-docker-pull.png)

Dan jika kita lihat di [browse repository]() -> [docker-group]() berikut image nginx yang telah terdownload dari docker hub di nexus:

![nexus-download]({{ page.image_path | prepend: site.baseurl}}/03d-nexus-download-from-dockerhub.png)

## Setup NKE private registry

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