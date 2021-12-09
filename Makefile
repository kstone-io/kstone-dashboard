PROJECT := "kstone-dashboard"
DOCKERDIR := "."
RegistryNamespace := "tkestack"
IMAGE := ${RegistryNamespace}/${PROJECT}

TAG := $(shell git describe --dirty --always --tags)
IMAGEID := ${IMAGE}:${TAG}

.PHONY: build
build:
	@docker build --network=host --no-cache -t ${IMAGEID} -f ${DOCKERDIR}/Dockerfile ${DOCKERDIR}

.PHONY: push
push: build
	@docker push ${IMAGEID}