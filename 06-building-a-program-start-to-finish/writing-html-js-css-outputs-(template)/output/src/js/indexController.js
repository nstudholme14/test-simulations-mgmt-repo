const app = angular.module('angular', []);
app.controller('index', ['$scope', 'alertFactory', ($scope, alertFactory) => {
  $scope.result = '';
  $scope.content = {};
  $scope.documentCount = {};
  $scope.titles = {};
  $scope.showIndex = false;
  $scope.showSearch = false;

  const invertedIndex = new InvertedIndex();

// function to read content from each file and validate JSON content structure
  $scope.validateFiles = () => {
    const badExtention = [];
    const goodExtention = [];
    const fileInput = document.getElementById('fUpload');
    Object.keys(fileInput.files).forEach((file) => {
      const eachFile = fileInput.files[file];
      if (!eachFile.name.toLowerCase().match(/\.json$/)) {
        badExtention.push(eachFile.name);
      } else {
        try {
          goodExtention.push(eachFile.name);
          InvertedIndex.readFile(eachFile).then((response) => {
            if (response.status) {
              $scope.content[eachFile.name] = response.jsonContent;
              const documentTitles = [];
              const count = [];
              let index = 0;
              response.jsonContent.forEach((doc) => {
                documentTitles.push(doc.title);
                count.push(index);
                index += 1;
              });
              $scope.titles[eachFile.name] = documentTitles;
              $scope.documentCount[eachFile.name] = count;
            } else {
              alertFactory.error('Unable to read that file', error);
            }
          }).catch((error) => {
            alertFactory.error('Unable to read file', error);
          });
        } catch (error) {
          alertFactory.error(`${eachFile.name} 
            does not have the right structure`);
        }
      }
    });
    badExtention.forEach((ext) => {
      alertFactory.error(`Bad Extension: ${ext}`);
    });
    goodExtention.forEach((ext) => {
      alertFactory.success(`Good Extension(s): ${ext}`);
    });
  };

  $scope.createBookIndex = () => {
    Object.keys($scope.content).forEach((fileName) => {
      try {
        $scope.fileIndices = invertedIndex
        .createIndex($scope.content[fileName], fileName);
        $scope.showIndex = true;
        $scope.showSearch = false;
      } catch (err) {
        alertFactory.error('Unsuccessful, please upload a .JSON book', err);
      }
    });
  };

  $scope.searchBookIndex = () => {
    $scope.searchFeedback = {};
    const searchInput = $scope.search;
    const searchBook = $scope.bookList;
    if (searchInput === undefined && searchBook !== undefined) {
      searchFeedback = invertedIndex.getIndex(searchBook);
    } else if (searchInput !== undefined && searchBook !== undefined) {
      if (searchBook === 'All') {
        $scope.searchFeedback = invertedIndex
          .searchIndex(searchInput, searchBook);
        $scope.showIndex = false;
        $scope.showSearch = true;
      } else {
        $scope.searchFeedback[searchBook] = invertedIndex
            .searchIndex(searchInput, searchBook)[searchBook];
        $scope.showIndex = false;
        $scope.showSearch = true;
      }
    } else { return 'Please select a file to search for words'; }
  };
}]);

app.factory('alertFactory', () => ({
  success: (text) => {
    toastr.success(text, 'Success');
  },
  error: (text) => {
    toastr.error(text, 'Error');
  }
}));