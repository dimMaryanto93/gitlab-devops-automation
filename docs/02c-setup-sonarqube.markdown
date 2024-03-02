Enable security for Code Scanning, Dependency Vulnerability, Code coverage. we'll cover:

1. System requirement
2. Installation
3. Configuration
4. Example using automation seperti scanner-cli, jacoco dan lain-lain.

## System requirement

- Linux OS: Centos, RockyLinux, OracleLinux
    - CPUs: `4 cores` or more
    - RAM: `16 GB` or more
    - Storage: `20 GB` or more
- Oracle JDK 17
- PostgreSQL 15

Harderning os (required) to start sonarqube apps

- Set `vm.max_map_count` and `fs.file-max` into `/etc/sysctl.d/99-sonarqube.conf`
    ```conf
    # add this line
    vm.max_map_count=524288
    fs.file-max=131072
    ```

- Set open descriptors into `/etc/security/limits.d/99-sonarqube.conf` 
    ```conf
    sonarqube   -   nofile   131072
    sonarqube   -   nproc    8192
    ```
- Then reboot system, to apply the changes

## Installation

Download Oracle JDK 17 from [Oracle Website](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)

```bash
wget 'https://download.oracle.com/java/17/archive/jdk-17.0.10_linux-x64_bin.rpm' -O Downloads/jdk-17.0.10_linux-x64_bin.rpm && \
sudo rpm -Uivh Downloads/jdk-17.0.10_linux-x64_bin.rpm
```

Install PostgreSQL 15 from [website](https://www.postgresql.org/download/linux/redhat/)

```bash
# Install the repository RPM:
sudo yum install -y https://download.postgresql.org/pub/repos/yum/reporpms/EL-7-x86_64/pgdg-redhat-repo-latest.noarch.rpm

# Install PostgreSQL:
sudo yum install -y postgresql15-server

# Optionally initialize the database and enable automatic start:
sudo /usr/pgsql-15/bin/postgresql-15-setup initdb
sudo systemctl enable postgresql-15
sudo systemctl start postgresql-15

# Login into user postgres (linux)
sudo -i
su postgres

# Login to postgres db system
psql

# Change password for user postgress
\password
```

Changed default address for `127.0.0.1/25` from `/var/lib/pgsql/15/data/pg_hba.conf` like this:

```conf
# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             all                                     peer
# IPv4 local connections:
host    all             all             0.0.0.0/0               scram-sha-256
# IPv6 local connections:
host    all             all             ::1/128                 scram-sha-256
```

Then try login into postgresql from nomal user using this command:

```bash
psql -h localhost -U postgres

# create user and database for sonarqube
CREATE USER sonarqube WITH LOGIN PASSWORD '<your-password>';
CREATE DATABASE sonarqube WITH OWNER sonarqube;
ALTER USER sonarqube SET search_path TO sonarqube;
```

Download sonarqube community edition

```bash
wget 'https://binaries.sonarsource.com/Distribution/sonarqube/sonarqube-10.4.1.88267.zip' -O Downloads/sonarqube-10.4.1.88267.zip && \
sudo mkdir -p /opt/sonarqube && \
sudo unzip Download/sonarqube-10.4.1.88267.zip -d /opt/sonarqube/ && \
sudo mkdir -p /var/opt/sonarqube/{data,temp}
```

Create user linux to sonar running application

```bash
sudo adduser sonarqube && \
sudo chown -R sonarqube:sonarqube /opt/sonarqube/** && \
sudo chown -R sonarqube:sonarqube /var/opt/sonarqube/** && \
sudo chmod -R 777 /var/opt/sonarqube/** 
```

Setelah itu update config file `sonar.properties` seperti berikut:

```config
# User credentials.
sonar.jdbc.username=sonarqube
sonar.jdbc.password=<your-password>

#----- PostgreSQL 11 or greater
sonar.jdbc.url=jdbc:postgresql://localhost:5432/sonarqube?currentSchema=public

# WEB SERVER
sonar.web.javaOpts=-Xmx512m -Xms128m -XX:+HeapDumpOnOutOfMemoryError
sonar.web.host=0.0.0.0
sonar.web.port=9000

# JVM options of Elasticsearch process
sonar.search.javaOpts=-Xmx512m -Xms512m -XX:MaxDirectMemorySize=256m -XX:+HeapDumpOnOutOfMemoryError

# OTHERS
sonar.path.data=/var/opt/sonarqube/data
sonar.path.temp=/var/opt/sonarqube/temp
```

Selanjutnya tambahkan env pada os untuk override version java, tambahkan property `SONAR_JAVA_PATH` pada file `/etc/environment` seperti berikut:

```bash
SONAR_JAVA_PATH=/usr/lib/jvm/jdk-17-oracle-x64/bin/java
```

Setelah itu kita coba jalankan dengan perintah berikut:

```bash
# give granted port 9000 to access from outside
firewall-cmd --zone=public --add-port=9000/tcp --permanent && \
firewall-cmd --reload
# login use sonarqube user
su sonarqube
/opt/sonarqube/sonarqube-10.4.1.88267/bin/linux-x86-64/sonar.sh console
```

Makesure service elastic, tomcat, database connected seperti pada log berikut:

```log
2024.03.02 16:37:19 INFO  web[][o.s.s.p.Platform] Web Server is operational
2024.03.02 16:37:20 INFO  ce[][o.s.d.DefaultDatabase] Create JDBC data source for jdbc:postgresql://localhost:5432/sonarqube?currentSchema=public
2024.03.02 16:37:20 INFO  ce[][c.z.h.HikariDataSource] HikariPool-1 - Starting...
2024.03.02 16:37:20 INFO  ce[][c.z.h.p.HikariPool] HikariPool-1 - Added connection org.postgresql.jdbc.PgConnection@e24be4d
2024.03.02 16:37:20 INFO  ce[][c.z.h.HikariDataSource] HikariPool-1 - Start completed.
2024.03.02 16:37:21 INFO  ce[][o.s.s.p.ServerFileSystemImpl] SonarQube home: /opt/sonarqube/sonarqube-10.4.1.88267
2024.03.02 16:37:21 INFO  ce[][o.s.c.c.CePluginRepository] Load plugins
2024.03.02 16:37:21 INFO  ce[][o.s.c.c.ComputeEngineContainerImpl] Running Community edition
2024.03.02 16:37:21 INFO  ce[][o.s.ce.app.CeServer] Compute Engine is started
2024.03.02 16:37:22 INFO  app[][o.s.a.SchedulerImpl] Process[ce] is up
2024.03.02 16:37:22 INFO  app[][o.s.a.SchedulerImpl] SonarQube is operational
```

Setelah itu kita bisa akses webnya di alamat [http://your-ip:9000](http://localhost:9000) maka akan muncul seperti berikut:

![sonarqube](images/sonarqube/01-console.png)

Kemudian login menggunakan user `admin` password `admin` setelah itu ganti default admin user. Kemudian kita akan diarahkan ke halaman dashboard utama seperti berikut:

![dashboard](images/sonarqube/01a-default-dashboard.png)

Tahap selanjutnya kita akan stop servicenya dengan menggunakan `CTRL + C`, kemudian kita buat file `.service` supaya begitu server restart bisa auto start. caranya kita buat file `/etc/systemd/system/sonarqube.service` seperti berikut:

```service
[Unit]
Description=SonarQube service
After=syslog.target network.target

[Service]
Type=simple
User=sonarqube
Group=sonarqube
PermissionsStartOnly=true
ExecStart=/bin/nohup /usr/lib/jvm/jdk-17-oracle-x64/bin/java -Xms32m -Xmx32m -Djava.net.preferIPv4Stack=true -jar /opt/sonarqube/sonar-application.jar
StandardOutput=journal
LimitNOFILE=131072
LimitNPROC=8192
TimeoutStartSec=5
Restart=always
SuccessExitStatus=143

[Install]
WantedBy=multi-user.target
```

Kemudian kita buat symlink untuk file `sonar-application.jar` seperti berikut:

```bash
# login to sonarqube
so sonarqube

# change dir to /opt/sonarqube
cd /opt/sonarqube/

# create symlimk
ln -s sonarqube-10.4.1.88267/lib/sonar-application-10.4.1.88267.jar sonar-application.jar

exit
```

Kemudian kita coba jalankan servicenya dengan perintah berikut:

```bash
systemctl daemon-reload && \
systemctl enable --now sonarqube
```