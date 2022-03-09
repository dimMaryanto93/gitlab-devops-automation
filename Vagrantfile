Vagrant.configure("2") do |config|
  config.vm.box = "centos/7"
  config.vm.provider :virtualbox do |vm|
    vm.memory = 8192
    vm.cpus = 2
    vm.gui = false
  end
  config.vm.provision "docker" do |d|
  end
  config.vm.hostname = "vm-dev1.tabeldata.com"
  config.vm.network "private_network", type: "dhcp", virtualbox__intnet: true
end
