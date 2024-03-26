#!/bin/sh
BASEDIR=$(dirname $0)
ENV_PRE="dev-"
ENV_SUF="-dev"
SCHEME="https://"
TYPE="builder"
DOMAIN=".redbrickclass.ai/"
DIRECTORY="build_release"

while getopts ":t:" OPT; do
	case $OPT in
		t)
			echo >&2 "option: $OPTARG"
			case $OPTARG in
				dev | prod )
					OPT_ENV=$OPTARG
					;;
				* )
					echo >&2 "ERR: Invalid env : $OPTARG"
					exit 1
					;;
			esac
			;;
		\?)
			echo >&2 "ERR: Invalid option : $OPTARG"
			exit 1
			;;
		:)
			echo >&2 "ERR: Option -$OPTARG requires an argument"
			exit 1
			;;
	esac
done

if [ -z $OPT_ENV  ]; then
	echo "Deploy to env..."
	echo "1) dev  (dev-${TYPE}${DOMAIN})"
	echo "2) prod (    ${TYPE}${DOMAIN})"
	read -p "-> " OPT_ENV
fi

case "$OPT_ENV" in
prod )
	ENV_PRE=""
	ENV_SUF=""
	;;
*) ;;
esac

if [ ! -d $DIRECTORY ]; then
	echo "$DIRECTORY does not exist"
	exit 1
fi

cd ./$DIRECTORY

echo "Deployment will be done as following :"
echo "* Target            : ${SCHEME}${ENV_PRE}${TYPE}${DOMAIN}"
echo "* Current directory : $(pwd)"
echo "* File list:"
for file in *; do
	if [ -f "$file" ]; then
		echo "    ${file}"
	else
		echo "    ${file}/"
	fi
done
read -p "Proceed? [Y/n] " OPT_PRCD

case "$OPT_PRCD" in
y | Y | "")
	aliyun oss rm oss://redbrick-makers-${TYPE}${ENV_SUF}/ -r -f &&
	aliyun oss cp ./ oss://redbrick-makers-${TYPE}${ENV_SUF}/ -r &&
 	aliyun cdn RefreshObjectCaches --ObjectPath ${SCHEME}${ENV_PRE}${TYPE}.redbrickclass.ai/ --ObjectType Directory
	;;
n | *)
	echo "Aborting"
	exit 1
	;;
esac
