# Setup Multiple Kubernetes cluster

The most case schenario, biasanya untuk deployment menggunakan banyak cluster sebagai contoh `development`, `staging` dan `production` jadi minimal kita harus setup 3 cluster kubernetes seperti berikut:

![setup-multiple-cluster](images/multi-clusters/01-kubernetes-integration.png)

Kemudian kita buat `Deployments -> Environments` untuk yang kita inginkan sebagai contoh `review` dan `production` seperti berikut:

![setup-environtment](images/multi-clusters/02-environments.png)

Setelah itu kita setup juga `Settings -> CI/CD -> Environment Variable`, Kita tambahkan env `KUBE_CONFIG` untuk Environment Scope `production` dan `review` seperti berikut:

![setup-env-variables](images/multi-clusters/03-env-variables.png)

## Trigger build 

Untuk men-trigger source-code kita bisa membuat `git tag`, atau bisa melalui gitlab menu `Repository -> Tags` kemudian buat tag dengan prefix `-release` contohnya seperti berikut:

![trigger-build](images/multi-clusters/04-git-tags.png)

Kemudian kita bisa check di menu `CI/CD -> Pipeline` seperti berikut workflow

![cicd-pipeline](images/multi-clusters/05-pipeline-workflow.png)

Sekarang kita bisa liat di Stage `Review -> review-apps` maka hasilnya seperti berikut:

![review-apps-stage](images/multi-clusters/06-pipeline-review-apps.png)

Selain itu juga kita bisa check di `Deployments -> Environtment -> Review` seperti berikut:

![env-review-apps](images/multi-clusters/07-environment-review-apps.png)

Aplikasi kita sudah terdeploy di kubernetes cluster dengan node `dev.dimas-maryanto.com`

Selanjutnya kita kita mau deploy ke stage `production`, kita bisa jalankan `Play Button` pada menu `CI/CD -> Pipeline -> your version tags -> Run Manual -> Deploying` seperti berikut

![production-stage](images/multi-clusters/08-deploying-button.png)

Setelah itu check stage Pipeline `deploying` maka hasilnya akan mendeploy ke kubernetes cluster production yaitu `prod.dimas-maryanto.com` seperti berikut:

![production-pipeline](images/multi-clusters/09-pipeline-deploy-prod.png)

Kemudian kita liat di sisi `Deployments -> Environments -> Production` hasilnya seperti berikut:

![env-production-apps](images/multi-clusters/10-env-production-apps.png)

Jadi kesimpulannya, kita bisa deployment secara otomatis ke environment `development`, `staging`, bahkan `production` dengan sangat simple yaitu menggunakan trigger
