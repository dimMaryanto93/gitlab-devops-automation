## To connect a Kubernetes cluster to GitLab

Before you can install the agent in your cluster, you need:

An existing Kubernetes cluster. If you don't have a cluster, you can create one on a cloud provider, like:

- Google Kubernetes Engine (GKE)
- Amazon Elastic Kubernetes Service (EKS)
- Digital Ocean

On self-managed GitLab instances, a GitLab administrator must set up the
agent server. In `gitlab.rb` when `external_url` property look like

```rb
external_url 'http://192.168.88.99'
```

Then it is available by default at `wss://192.168.88.99/-/kubernetes-agent/`.
On GitLab.com, the agent server is available at `wss://192.168.88.99`.

ref: 
- https://docs.gitlab.com/ee/user/clusters/agent/install/

## Create an agent configuration file

After `gitlab_kas` enabled, then we need configure file using a YAML file in the GitLab project/repository.

To create an agent configuration file:

1. Choose a name for your agent. The agent name follows the [DNS label standard from RFC 1123](https://www.rfc-editor.org/rfc/rfc1123). The name must:
    - Be unique in the project.
    - Contain at most 63 characters.
    - Contain only lowercase alphanumeric characters or -.
    - Start with an alphanumeric character.
    - End with an alphanumeric character.
2. In the repository, in the default branch, create this directory at the root:

    ```bash
    .gitlab/agents/<agent-name>
    ```

3. In the directory, create a `config.yaml` file. Ensure the filename ends in `.yaml`, not `.yml`.

You can leave the file blank for now, and commit & push.

![config.yaml](images/gitlab-integration/01-configuration-files.png)

## Register the agent with GitLab

You must register an agent before you can install the agent in your cluster. To register an agent:

1. On the top bar, select **Main menu > Projects** and find your project. If you have an agent configuration file, it must be in this project. Your cluster manifest files should also be in this project.

2. From the left sidebar, select **Infrastructure > Kubernetes clusters**.
    ![kubernetes-agent](images/gitlab-integration/02-gitlab-kas.png)

3. Select Connect a cluster (agent). then select agent-name has been created before
    ![select-agent](images/gitlab-integration/02a-select-agent.png)

4. Click button Register. GitLab generates an access token for the agent. You need this token to install the agent in your cluster.

5. Copy the command under **Recommended installation** method. You need it when you use
the one-liner installation method to install the agent in your cluster.

```bash
export GITLAB_KAS_WSS="ws://<domain-or-ip-server>/-/kubernetes-agent/" && \
export GITLAB_ACCESS_TOKEN=<access-token-from-gitlab-kas>

helm repo add gitlab https://charts.gitlab.io
helm repo update
helm upgrade --install devel gitlab/gitlab-agent \
    --namespace gitlab-agent-devel \
    --create-namespace \
    --set image.tag=v15.9.0 \
    --set config.token=$GITLAB_ACCESS_TOKEN \
    --set config.kasAddress=$GITLAB_KAS_WSS
```

Jika diexecute hasilnya seperti berikut:

![install-kubernetes-resources](images/gitlab-integration/02b-kubernetes-resources.png)

After that, now you can see status in list cluster look like this:

![list cluster](images/gitlab-integration/02c-list-cluster.png)