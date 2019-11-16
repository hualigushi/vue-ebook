#touch update.sh
@chmod +x update.sh

 echo "start updating frontend..."
 cd /root/ebook/vue-ebook
 echo "updating source"
 git pull
 echo "frontend building"
 npm run building
 echo "frontend publish"
 rm -rf ~/nginx/upload/book
 mv dist ~/nginx/upload/book
 echo "finish updating frontend..."


echo "start updating backend..."
cd /root/ebook/node-ebook
echo "updating source..."
git pull
echo "stop service..."
kill -9 `ps -ef|grep node|grep app.js|awk '{print $2}'`
echo "restart service"
node app.js
echo "finish updating backend..."
 # ./updating.sh