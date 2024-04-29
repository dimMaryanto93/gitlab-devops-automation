#!/bin/bash
echo "Installing dependency!!!"
ansible-galaxy role install -r requirements.yaml --force && \
ansible-galaxy collection install -r requirements.yaml --force