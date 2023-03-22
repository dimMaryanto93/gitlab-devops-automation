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

