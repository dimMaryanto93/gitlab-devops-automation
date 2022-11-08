Vagrant.configure("2") do |config|
  config.vm.box = "centos/7"

  config.vm.define "gitlab" do |gitlab|
    gitlab.vm.hostname = "gitlab.dimas-maryanto.com"
    gitlab.vm.network "private_network", ip: "192.168.56.8", name: "vboxnet0"
    gitlab.vm.network "forwarded_port", id: "ssh", host: "2208", guest: 22
    gitlab.vm.provider :virtualbox do |vm|
      vm.memory = 4096
      vm.cpus = 2
      vm.gui = false
    end
  end

  config.vm.define "etcd" do |lb|
    lb.vm.hostname = "etcd.dimas-maryanto.com"
    lb.vm.network "private_network", ip: "192.168.99.9", name: "vboxnet0"
    lb.vm.network "forwarded_port", id: "ssh", host: "2209", guest: 22
    lb.vm.provider :virtualbox do |vm|
      vm.memory = 2096
      vm.cpus = 1
      vm.gui = false
    end
  end
  
  config.vm.define "master" do |ctlpanel|
    ctlpanel.vm.hostname = "vm-k8s-master.dimas-maryanto.com"
    ctlpanel.vm.network "private_network", ip: "192.168.99.10", name: "vboxnet0"
    ctlpanel.vm.network "forwarded_port", id: "ssh", host: 2210, guest: 22
    ctlpanel.vm.provider :virtualbox do |vm|
      vm.memory = 2048
      vm.cpus = 2
      vm.gui = false
    end
    # config.vm.provision "docker" do |d|
    # end
  end

  (1..1).each do |idx|

    config.vm.define "worker-0#{idx}" do |worker|
      worker.vm.hostname = "vm-k8s-worker#{idx}.dimas-maryanto.com"
      worker.vm.network "private_network", ip: "192.168.99.1#{idx}", name: "vboxnet0"
      worker.vm.network "forwarded_port", id: "ssh", host: "221#{idx}", guest: 22
      worker.vm.provider :virtualbox do |vm|
        vm.memory = 2048
        vm.cpus = 2
        vm.gui = false
      end
      # config.vm.provision "docker" do |d|
      # end
    end
  end

end
