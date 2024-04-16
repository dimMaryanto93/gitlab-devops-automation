---
title: "01b - Create disk image (vm template)"
date: 2024-03-09T15:15:50+07:00
catalog_key: preparation
categories:
- Nutanix
- VMs
- Images
refs: []
image_path: /resources/imgs/01b-create-disk-image
gist: 
downloads: []
---

First we need download the image of Operation System, we choose [Centos 7](https://www.centos.org/download/) and the version is [CentOS-7-x86_64-Minimal-2207-02.iso](http://vpsmurah.jagoanhosting.com/centos/7.9.2009/isos/x86_64/CentOS-7-x86_64-Minimal-2207-02.iso)

## Prepare image

Sekarang kita ke [Prism Central]() akses menu [Compute & Storage]() kemudian [Images]() dan click button [Add Image]() pilih [from URL]() masukan url image Centos seperti berikut [http://vpsmurah.jagoanhosting.com/centos/7.9.2009/isos/x86_64/CentOS-7-x86_64-Minimal-2207-02.iso]() seperti berikut

![upload image]({{ page.image_path | prepend: site.baseurl}}/01-upload-image.png)

Kemudian [Upload File](), wait sampai image Centos 7 selesai download and [Next]().

## Deploy vm

Setelah image terdownload successfully, kita buat virtual machine dari [Prism Central]() akses menu [Compute & Storage]() kemudian [VMs]() dan [Create VM]() dengan specifikasi:

```yaml
name: template-centos7-2202-2
numberVM: 1
vmProperties:
    cpu: 2
    corePerCPU: 2
    memory: 4
```

Seperti berikut:

![create-vm]({{ page.image_path | prepend: site.baseurl}}/02-create-vm.png)

Kemudian [Next](), selanjutnya kita attach disk dan network dengan specifikasi seperti berikut:

```yaml
disks: 
    - type: Disk
      operations: Allocate on Storage Container
      storageContainer: default-storage
      capacity: 50 GiB
      busType: SCSI
    - type: CD-ROM
      operation: Empty CD-ROM
      busType: SATA
networks:
    - subnet: Primary
      networkConnectionState: Connected
      assignmentType: Assign with DHCP
bootConfiguration: Legacy BIOS Mode
```

Seperti berikut:

![vm-resources]({{ page.image_path | prepend: site.baseurl}}/02a-vm-resources.png)

Selanjutnya klick [Next](), pada tab management seperti berikut:

![vm-management]({{ page.image_path | prepend: site.baseurl}}/02b-vm-management.png)

Kita bisa skip saja dengan nilai default, kemudian [Next]() maka muncul halaman review seperti berikut:

![vm-creation-review]({{ page.image_path | prepend: site.baseurl}}/02c-vm-creation-review.png)

Sekarang jika temen-temen lihat, vm sudah terbuat seperti berikut:

![vm-created]({{ page.image_path | prepend: site.baseurl}}/02d-vm-created.png)

## Installing OS Centos 7

Sekarang kita Turn On vm `template-centos7-2202-2` dengan cara checklist vm, kemudian klick [Action]() dan pilih [Power On]() kemudian klik detail vm tersebut sehingga masuk ke detail tersebut 

![vm-detail]({{ page.image_path | prepend: site.baseurl}}/03-vm-details.png)

dan pilih tab [Console]() dan [launch in new windows]() seperti berikut:

![vm-console]({{ page.image_path | prepend: site.baseurl}}/03a-vm-launch-in-new-windows.png)

Kemudian klik [Mount ISO]() dan pilih iso yang telah kita download yaitu [CentOS-7-2207-2.iso]() seperti berikut:

![vm-mount-iso]({{ page.image_path | prepend: site.baseurl}}/03b-mount-iso.png)

Kemudian klick [Mount]() dan kemudian restart vm dengan cara click button [Send CTRL+ALT+DEL]() sekarang kita masuk ke bootloader installer CentOS 7 seperti berikut:

![vm-boot-centos-installer]({{ page.image_path | prepend: site.baseurl}}/03c-centos-boot-install.png)

Kita pilih [Install CentOS 7]() kemudian akan muncul pilih langunage seperti berikut:

![install-centos-language]({{ page.image_path | prepend: site.baseurl}}/03d-select-language.png)

Selanjutnya, klick [Continue](). Maka kita perlu setting dengan specifkasi seperti berikut:

```yaml
date-time:
    region: Asia
    city: Jakarta
    networkTime: True
softwareSelection: Minimal install
installSource: Local media
system:
    installDestination:
        disk: 
            "/boot": 1024 MiB
            "/": 45 Gib
            "swap": 2968 GiB
    network-hostname:
        eth0: 
            enable: true
            dhcp: true
        hostname:
            name: default
```

Seperti berikut:

![vm-installation-summary]({{ page.image_path | prepend: site.baseurl}}/03e-vm-installation-summary.png)

Kemudian [Begin Installation](), maka kita buat setup untuk root password dan create user dengan specifkasi seperti berikut:

```yaml
root-user:
    password: 'passwordnyaAdmin'
new-user:
    fullname: Administrator
    user: admin
    makeThisUserAdministrator: checklist
    requiredPassword: checklist
    password: password
```

Jika muncul confirm password is weak, klick [Done]() 2x, seperti berikut:

![create-user-os]({{ page.image_path | prepend: site.baseurl}}/03f-create-vm-user.png)

kemudian tunggu sampai proses installasi selesai seperti berikut:

![os-finish-installed]({{ page.image_path | prepend: site.baseurl}}/03g-os-finish-installed.png)

Final step is, klik [Finish configuration]() jika sudah maka vm akan reboot. Dan temen-temen bisa login dengan user account yang telah di buat seperti berikut:

![os-login]({{ page.image_path | prepend: site.baseurl}}/03h-os-login.png)

## Post Install OS installation

Setelah OS CentOS 7 terpasang, dan temen-temen bisa login ada beberapa setting yang perlu kita lakukan untuk membuat starter/vm template diantaranya:

- Disable selinux (set permissive mode)
- Update/Patch OS CentOS
- Install commons package like `curl`, `wget`, `tmux`, `unzip` dll

Sekarang kita akan disable selinux, caranya login sebagai root kemudian edit file `/etc/selinux/config` menggunakan editor seperti `vi` seperti berikut:

```conf
SELINUX=permissive
```

Save dan quit, setelah itu reboot VM. Setelah nyala kembali vm kita bisa check menggunakan command `sestatus` makesure status outpunya seperti berikut:

```bash
[root@template-centos7-2202-2 ~]# sestatus
SELinux status:                 enabled
SELinuxfs mount:                /sys/fs/selinux
SELinux root directory:         /etc/selinux
Loaded policy name:             targeted
Current mode:                   permissive
Mode from config file:          permissive
Policy MLS status:              enabled
Policy deny_unknown status:     allowed
Max kernel policy version:      31
```

Kemudian kita update packages pada os dengan menggunakan command seperti berikut:

```bash
yum update -y
```

Setelah semua package already up to date, sekarang kita install package commons yang nanti kita akan gunakan dengan menggunakan perintah berikut:

```bash
yum install -y curl wget unzip tar epel-release && \
yum install -y htop
```

## Export vm as disk

Setelah VM, OS, Package sebagai base template sudah siap. Kita akan buat vm tersebut menjadi disk image sehingga kita bisa clone, replikasi di kemudian hari. Caranya kita poweroff dahulu seperti berikut:

![vm-poweroff]({{ page.image_path | prepend: site.baseurl}}/03i-poweroff-vm.png)

Kemudian kita ke menu [Images]() kemudian [Add Image]() dan pilih [VM Disk]() kemudian search VM Name `template-centos7-2202-2` seperti berikut:

![vm-add-image-disk]({{ page.image_path | prepend: site.baseurl}}/04-add-image-disk.png)

Kemudian Klick button [+]() kemudian kita seting specifikasinya seperti berikut:

```yaml
image:
    name: centos7-2207-2.disk
    descrition: Template centos 7 v2202.2
```

Jadi seperti ini:

![vm-disk-mapping-add]({{ page.image_path | prepend: site.baseurl}}/04a-add-disk-mapping-from-vm.png)

Kemudian klick [Next](), lalu kita pilih dan simpan pada cluster seperti berikut:

![vm-disk-location]({{ page.image_path | prepend: site.baseurl}}/04b-vm-disk-location.png)

Finaly klick button [Save](), maka dengan begitu vm akan di export sebagai disk. hasilnya seperti berikut:

![vm-disk-result]({{ page.image_path | prepend: site.baseurl}}/04c-vm-disk-list.png)
