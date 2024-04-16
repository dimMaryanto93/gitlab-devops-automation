---
title: "01 - Instructor Preparation"
date: 2024-03-02T23:08:35+07:00
catalog_key: preparation
categories:
- Nutanix
- NKE
refs: []
image_path: /resources/imgs/01-instructure-prep
gist: 
downloads: []
---

Sebagai instructure, ada beberapa yang perlu disiapkan terkait environtment training dengan tajuk `Best practice implementasi DevSecOps with Gitlab` diantaranya:

- Create image profile (disk image) based on Centos 7
- Enable Nutanix Kubernetes Engine v2.8.0 or latest
    - Enable Karbon airgap
    - Create Kubernetes Cluster
- Enable Nutanix Database
    - Provision PostgreSQL 10.x database
- Enable Nutanix Files
    - Setup export folder
    - Create PVC
- Enable DevSecOps Tools
    - Install Gitlab
    - Install & Configure gitlab-runner with docker executor
    - Install & Configure Nexus OSS
    - Install Sonarqube