## Enable TLS

If you are on a self-managed GitLab instance, ensure your instance is configured with Transport Layer Security (TLS).
If you attempt to use kubectl without TLS, you might get an error like:

```bash
$ kubectl get pods
error: You must be logged in to the server (the server has asked for the client to provide credentials)
```

ref: https://docs.gitlab.com/omnibus/settings/ssl/

## 