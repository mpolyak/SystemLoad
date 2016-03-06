$script = <<SCRIPT

sudo apt-get update
sudo apt-get install -y curl build-essential 

curl https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash

source ~/.nvm/nvm.sh

echo "source ~/.nvm/nvm.sh" >> ~/.bashrc

nvm install v4.3.1
nvm alias default v4.3.1

npm install -g node-gyp

echo "cd /vagrant" >> ~/.bashrc

cd /vagrant

SCRIPT

Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.provider "virtualbox" do |v|
    v.name = "SystemLoad"
    v.memory = 512
    v.cpus = 1
  end

  config.vm.box_check_update = false

  config.vm.provision :shell, inline: $script, privileged: false

  config.vm.network :forwarded_port, host: 3000, guest: 3000
end