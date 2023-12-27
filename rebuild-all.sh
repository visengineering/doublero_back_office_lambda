echo Building Shared Util
cd shared/common-util
npm run build
echo Building Shared DB
cd ../common-db
npm run build
cd ../common-services
npm run build
cd ../marketing-feeds
npm run build
cd ../..  # getting back to project root

echo Building Utils
cd utils
npm run build
cd ..  # getting back to project root

echo Building Product Updater Service
cd product-updater
npm run build
cd ..  # getting back to project root

echo Building Marketing Feeds Service
cd marketing-feeds
npm run build
cd ..  # getting back to project root

echo Building Customer Reviews Service
cd customer-reviews
npm run build
cd ..  # getting back to project root

echo Building BI Integration Service
cd bi-integration
npm run build
cd ..  # getting back to project root