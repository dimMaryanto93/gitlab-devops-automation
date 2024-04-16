var store = [{
        "title": "01 - Instructor Preparation",
        "excerpt":"Sebagai instructure, ada beberapa yang perlu disiapkan terkait environtment training dengan tajuk Best practice implementasi DevSecOps with Gitlab diantaranya: Create image profile (disk image) based on Centos 7 Enable Nutanix Kubernetes Engine v2.8.0 or latest Enable Karbon airgap Create Kubernetes Cluster Enable Nutanix Database Provision PostgreSQL 10.x database Enable Nutanix...","categories": ["Nutanix","NKE"],
        "tags": [],
        "url": "/gitlab-devops-automation/nutanix/nke/01-instructure-prep/",
        "teaser": null
      },{
        "title": "01a - PreCheck & Update Cluster HPOC",
        "excerpt":"Setelah kita mendapatkan Cluster HPOC, pertama kita perlu check dulu version dari Prism Element dan Prism Central berserta componentnya. Prism Element Ada beberapa precheck pada prism element diantaranya: AHV &amp; AOS Version Cluster resource (CPUs &amp; Memory) LCM Update Untuk AHV version kita bisa check di Web Prism Element dengan...","categories": ["Nutanix","Cluster","HPOC"],
        "tags": [],
        "url": "/gitlab-devops-automation/nutanix/cluster/hpoc/01a-precheck-hpoc/",
        "teaser": null
      },{
        "title": "01b - Create disk image (vm template)",
        "excerpt":"First we need download the image of Operation System, we choose Centos 7 and the version is CentOS-7-x86_64-Minimal-2207-02.iso Prepare image Sekarang kita ke Prism Central akses menu Compute &amp; Storage kemudian Images dan click button Add Image pilih from URL masukan url image Centos seperti berikut http://vpsmurah.jagoanhosting.com/centos/7.9.2009/isos/x86_64/CentOS-7-x86_64-Minimal-2207-02.iso seperti berikut Kemudian...","categories": ["Nutanix","VMs","Images"],
        "tags": [],
        "url": "/gitlab-devops-automation/nutanix/vms/images/01b-create-disk-image/",
        "teaser": null
      },{
        "title": "01c - Enable Karbon Airgap [Optional]",
        "excerpt":"Setelah kita enable Nutanix Kubernetes Engine (NKE) component, kemudian kita update NKE menjadi v2.8.0 atau yang terbaru. Kita perlu mengatifkan Karbon Airgap supaya proses pembuatan cluster bisa berjalan offline dan prosesnya lebih cepet. Berikut adalah step-by-step untuk mengaktifkan Karbon Airgap: Deploy webserver sebagai Darksite Download &amp; Upload Karbon Airgap resources...","categories": ["Nutanix","Kubernetes","NKE","Airgap"],
        "tags": [],
        "url": "/gitlab-devops-automation/nutanix/kubernetes/nke/airgap/01c-enable-karbon-airgap/",
        "teaser": null
      },{
        "title": "01d - Install & Configure Nexus OSS as Container Registry",
        "excerpt":"The an other way for storing/accessing container image can be accessed locally is using Nexus OSS, The installation i’ll cover is: Deploying VM to using Nexus OSS Installing Nexus OSS Setup Container registry Setup authentication Setup NKE private registry Deploying VM to using Nexus OSS Pertama kita buat dulu sebuah...","categories": ["Nutanix","Container","Registry","NexusOSS"],
        "tags": [],
        "url": "/gitlab-devops-automation/nutanix/container/registry/nexusoss/01d-install-nexus-oss/",
        "teaser": null
      },{
        "title": "Setup VPN connection with ivanti",
        "excerpt":"description…     Materi:      Topic1   Topic2            Topic 2.a       Topic 2.b           Topic 3   Topic 4  ","categories": ["Nutanix","NKE"],
        "tags": [],
        "url": "/gitlab-devops-automation/nutanix/nke/00-connect-vpn/",
        "teaser": null
      }]
