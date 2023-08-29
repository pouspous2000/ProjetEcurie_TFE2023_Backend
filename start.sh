if [ -z "$1" ]; then
  echo "Usage: ./nom_du_script.sh <chemin_vers_backend>"
  exit 1
fi

backend_dir="$1"
frontend_repo="https://github.com/pouspous2000/ProjetEcurie_TFE2023_Front.git"
cd "$backend_dir"
git clone "$frontend_repo" frontend
cd frontend
npm install
npm run build
cd "$backend_dir"
docker-compose -f docker-compose_dev build
docker-compose down && docker-compose up