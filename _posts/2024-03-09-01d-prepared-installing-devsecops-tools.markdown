---
title: "01d - Prepare Installing DevSecOps Tools"
date: 2024-03-09T21:33:32+07:00
catalog_key: preparation
categories:
- Nutanix
- DevSecOps
- Tools
refs: []
image_path: /resources/imgs/01d-nexus-oss
gist: 
downloads: []
---

1. Create VM for Gitlab
2. Create VM for Gitlab-Runner
3. Create VM for Nexus OSS
4. Create VM for Sonarqube
5. Create VM for Apache Skywalking
6. Create VM for ansible

## Create VM for Nexus OSS

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