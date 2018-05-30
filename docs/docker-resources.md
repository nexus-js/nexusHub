# Docker resources

[GitHub - veggiemonk/awesome-docker: A curated list of Docker resources and projects](https://github.com/veggiemonk/awesome-docker)

## Introduction

### My life before Docker

It is easier to understand what Docker is if you can see what problems it is solving. When I first started developing networking music applications I was using an Amazon EC2 server. I had to install all the dependencies needed for the application on the server in addition to my local versions. This quickly becomes an issue trying to maintain two versions of an application on two machines with two separate operating systems.

A solution to this is Docker. With Docker we can recreate the conditions of the server on our local machine as an image then push and run that image in the cloud.

### docker docs

* [Get Started](https://docs.docker.com/get-started/#docker-concepts)

#### Docker concepts

Docker is a platform for developers and sysadmins to develop, deploy, and run applications with containers. The use of Linux containers to deploy applications is called containerization. Containers are not new, but their use for easily deploying applications is.

#### Containerization is increasingly popular because containers are:

* Flexible: Even the most complex applications can be containerized.
* Lightweight: Containers leverage and share the host kernel.
* Interchangeable: You can deploy updates and upgrades on-the-fly.
* Portable: You can build locally, deploy to the cloud, and run anywhere.
* Scalable: You can increase and automatically distribute container replicas.
* Stackable: You can stack services vertically and on-the-fly.

#### Images and containers

A container is launched by running an image. **An image is an executable package that includes everything needed to run an application**--the code, a runtime, libraries, environment variables, and configuration files.

**A container is a runtime instance of an image**--what the image becomes in memory when executed (that is, an image with state, or a user process). You can see a list of your running containers with the command, docker ps, just as you would in Linux.

#### Containers and virtual machines

A container runs natively on Linux and shares the kernel of the host machine with other containers. It runs a discrete process, taking no more memory than any other executable, making it lightweight.

By contrast, a virtual machine (VM) runs a full-blown “guest” operating system with virtual access to host resources through a hypervisor. In general, VMs provide an environment with more resources than most applications need.

### Dive into docker

* [Docker’s Biggest Wins](https://www.youtube.com/watch?v=YcqQI7jACTQ&index=2&list=PL-v3vdeWVEsXT-u0JDQZnM90feU3NE3v8)
  * Saving time and money (when running on a server)
  * very efficient use of system resources
  * allows isolating of development environments but shares what is common between docker containers
  * fast container start
  * portability across machines and environments
  * if it runs on your machine it will run anywhere
  * no issues with trying to install on a linux server that acts different than your OSX of windows machine
* [Virtual Machines vs Docker Containers - Dive Into Docker - YouTube](https://www.youtube.com/watch?v=TvnZTi_gaNc&index=5&list=PL-v3vdeWVEsXT-u0JDQZnM90feU3NE3v8)
  * docker containers
* [Visualizing Docker’s Architecture - Dive Into Docker - YouTube](https://www.youtube.com/watch?v=IxzwNa-xuIo&list=PL-v3vdeWVEsXT-u0JDQZnM90feU3NE3v8&index=7)
  * client
  * where docker commands are run
  * docker host
  * runs docker daemon
  * docker registry
  * like github for docker
  * hosts references to docker containers
  * https://hub.docker.com/

### Docker 101 - Introduction to docker

* [Docker 101](https://www.youtube.com/watch?v=z_ace9c97PE)
