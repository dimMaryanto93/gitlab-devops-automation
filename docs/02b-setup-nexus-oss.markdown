## Setup registry using Nexus OSS

The an other way for storing/accessing container image can be accessed locally is using Nexus OSS, The installation i'll cover is:

1. System requirement
2. Installing Nexus OSS
3. Setup Container registry
4. Setup authentication


## Installing Nexus OSS

Sekarang kita install, karena disini saya menggunakan Server Linux Centos 8, berikut adalah cara installnya

- Download dulu [nexus sonatype oss](https://www.sonatype.com/download-oss-sonatype)

- Setelah filenya di download, kemudian extract dengan perintah berikut

    ```bash
    tar -zxvf nexus-<version>.unix.tar.gz
    ```

- Pindahkan ke lokasi yang diiginkan, sebagai contoh saya pindahkan ke `/opt` seperti berikut

    ```bash
    sudo mkdir -p /opt/nexus && \
    sudo mv nexus-<version> /opt/nexus

    ## create symbolic executeable
    cd /opt/nexus && \
    ln -s nexus-<version>/bin/nexus nexus
    ```

- Buat user `nexus` di linux
   
   ```bash
    sudo adduser nexus && \
    sudo chown nexus:nexus /opt/nexus
   ```

- Kemudian kita buat service file dengan nama `nexus.service` di folder `/etc/systemd/system` seperti berikut

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


- Yang terakhir kita jalankan servicenya dengan perintah berikut:

    ```bash
    systemctl enable --now nexus.service
    ```

Kemudian coba akses, [http://localhost:8081](http://localhost:8081) maka hasilnya seperti berikut:

![Nexus Repository on localhost]({{ page.image_path | prepend: site.baseurl }}/nexus-welcome.png)
