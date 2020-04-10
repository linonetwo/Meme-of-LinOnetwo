## basepath 为项目所在的目录
basepath=$(dirname $(cd `dirname $0`; pwd))

cd $basepath

/usr/local/bin/node ./node_modules/.bin/tiddlywiki $1 --build index
cd $1
mv ./output/index.html ../index.html
rm -r ./output
