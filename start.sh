if [ -z "$1" ]; then
  echo "Usage: ./nom_du_script.sh <chemin_vers_backend>"
  exit 
fi

backend_dir="$1"
frontend_repo="https://github.com/pouspous2000/ProjetEcurie_TFE2023_Front.git"
git clone "$frontend_repo" frontend
cd "$backend_dir"
docker-compose up dev_db 
sleep 15
docker-compose -f docker-compose_dev.yml build
docker-compose -f docker-compose_dev.yml down && docker-compose -f docker-compose_dev.yml up -d

echo "Le script s'est exécuté avec succès ! Vous avez a présent accès à l'application : http://localhost:3000/"
