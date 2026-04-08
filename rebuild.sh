#!/bin/bash
cd "/c/Users/Clovis/Desktop/Programas Cayuri faculdade/atividades/antigravity-project-ALL"
docker-compose down
docker-compose up --build -d
docker ps -a
