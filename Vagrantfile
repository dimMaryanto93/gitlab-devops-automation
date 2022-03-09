Vagrant.configure("2") do |config|
  config.vm.box = "centos/7"
  config.vm.define "master" do |ctlpanel|
    ctlpanel.vm.hostname = "vm-k8s-master.dimas-maryanto.com"
    ctlpanel.vm.network "private_network", ip: "10.0.0.10", virtualbox__intnet: true
    ctlpanel.vm.provider :virtualbox do |vm|
      vm.memory = 4096
      vm.cpus = 2
      vm.gui = false
    end
    config.vm.provision "docker" do |d|
    end
  end

  config.vm.define "etcd" do |lb|
    lb.vm.hostname = "vm-k8s-etcd.dimas-maryanto.com"
    lb.vm.network "private_network", ip: "10.0.0.9", virtualbox__intnet: true
    lb.vm.provider :virtualbox do |vm|
      vm.memory = 2048
      vm.cpus = 1
      vm.gui = false
    end
  end

  (1..1).each do |idx|

    config.vm.define "worker-0#{idx}" do |worker|
      worker.vm.hostname = "vm-k8s-worker#{idx}.dimas-maryanto.com"
      worker.vm.network "private_network", ip: "10.0.0.1#{idx}", virtualbox__intnet: true
      worker.vm.provider :virtualbox do |vm|
        vm.memory = 2096
        vm.cpus = 1
        vm.gui = false
      end
      config.vm.provision "docker" do |d|
      end
    end

  end


  config.vm.provision "docker" do |d|
  end
end
