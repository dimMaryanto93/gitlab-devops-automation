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
sudo mkdir -p /var/opt/sonarqube/{data,temp} && \
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