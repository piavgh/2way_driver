angular.module('driver2way.controllers', [])

    .controller('TabCtrl', function ($scope, $state, $ionicPlatform, $ionicPopup) {
        $scope.settings = [{
            href: '#/tab/profile',
            title: 'Hồ sơ cá nhân',
            icon: 'ion-person'
        }, {
            href: '#/tab/chance',
            title: 'Cơ hội vận chuyển',
            icon: 'ion-star'
        }, {
            href: '#/tab/working',
            title: 'Đang thực hiện',
            icon: 'ion-paper-airplane'
        }, {
            href: '#/tab/history',
            title: 'Lịch sử giao dịch',
            icon: 'ion-filing'
        }];

        $scope.driverName = window.localStorage["fullName"] === undefined ? "" : window.localStorage["fullName"];

        $scope.driverAvatar = window.localStorage["avatar"] === undefined ? "" : window.localStorage["avatar"];

        $scope.exitApp = function () {
            $ionicPopup.show({
                title: 'Thông báo',
                template: '<div class="text-center">Bạn có muốn thoát ứng dụng ?</div>',
                buttons: [
                    {
                        text: 'Thoát',
                        type: 'button-positive',
                        onTap: function (e) {
                            navigator.app.exitApp();
                        }
                    },
                    {
                        text: 'Hủy',
                        type: 'button-stabbed'
                    }
                ]
            });
        }


    })

    .controller('LoginCtrl', function ($scope, $state, GlobalTpl, $rootScope, $http, $cordovaDevice) {
        //if ($cordovaNetwork.getNetwork() === 'none') {
        //    $ionicPopup.alert({
        //        title: 'Lỗi kết nối !',
        //        content: '<div class="only-text">Vui lòng bật Wifi hoặc 3G để sử dụng ứng dụng</div>'
        //    }).then(function (result) {
        //        navigator.app.exitApp();
        //    });
        //} else {
        //    if (window.localStorage['deviceID'] === undefined) {
        //        // Get UUID device
        //        window.localStorage['deviceID'] = $cordovaDevice.getUUID();
        //    }

        //$scope.deviceID = window.localStorage['deviceID'];

        if (window.localStorage['loggedIn'] === "true") {
            var options = {
                showLoad: true,
                method: 'get',
                url: $rootScope.config.url + "/drivers/"
                + window.localStorage['driverId'] + "/transactions?page=1&type=working"
            };

            GlobalTpl.request(options, function (response) {

                if (response.data && response.data.length > 0) {
                    $state.go('tab.working');
                } else {
                    $state.go('tab.chance');
                }
            }, function () {

            });
        }

        $scope.loginForm = {
            username: '',
            password: ''
        };

        function validForm() {
            if (!$scope.loginForm.username || typeof $scope.loginForm.username === 'undefined' || !$scope.loginForm.password || typeof $scope.loginForm.password === 'undefined') {
                return false;
            }
            return true;
        }

        $scope.doLogin = function () {
            if (!validForm()) {
                $scope.formWarning = "Vui lòng nhập đầy đủ thông tin";
            } else {
                $scope.formWarning = "";
                var options = {
                    showLoad: true,
                    method: 'get',
                    url: $rootScope.config.url + '/drivers/login?username=' + $scope.loginForm.username + "&password=" + $scope.loginForm.password
                };
                GlobalTpl.showLoading();
                $http(options).success(function (response) {
                    GlobalTpl.hideLoading();
                    if (response.errorCode === 0) {
                        window.localStorage['loggedIn'] = true;
                        window.localStorage['driverId'] = response.data.driverId;
                        window.localStorage['username'] = response.data.username;
                        window.localStorage['fullName'] = response.data.fullName;
                        window.localStorage['avatar'] = response.data.avatar;
                        $state.go('tab.chance');
                    } else {
                        GlobalTpl.showAlert({template: "Sai tài khoản hoặc mật khẩu"});
                    }
                }).error(function () {
                    GlobalTpl.hideLoading();
                    GlobalTpl.showAlert({template: "Vui lòng thử lại"});
                }).finally(function () {
                });
            }
        }
    }
    //}
)

    .
    controller('WorkingCtrl', function ($scope, $location, $rootScope, GlobalTpl) {
        $scope.workingRequests = [];
        $scope.page = 1;
        $scope.moreDataCanBeLoaded = false;
        $scope.first = true;

        $scope.doRefresh = function () {
            $scope.first = false;
            $scope.page = 1;
            $scope.workingRequests = [];
            LoadMainRequest();
        };

        $scope.loadMoreData = function () {
            LoadMainRequest();
        };

        $scope.loadData = function () {
            $scope.workingRequests = [];
            $scope.page = 1;
            LoadMainRequest();
            $scope.first = false;
        }

        function LoadMainRequest() {
            var options = {
                showLoad: true,
                showAlert: true,
                method: 'get',
                url: $rootScope.config.url + "/drivers/1/transactions?page=" + $scope.page + "&type=working"
            };

            GlobalTpl.request(options, function (response) {
                // Check there is existing data to load
                $scope.moreDataCanBeLoaded =
                    (response && response.data && response.data.length > 0) ? true : false;

                if (response.data && response.data.length > 0) {
                    // Fetch new requests
                    for (var i in response.data) {
                        var res = response.data[i];
                        $scope.workingRequests.push({
                            requestId: res.detail.id,
                            description: res.detail.description,
                            //clientPhone: res.client.phone,
                            createdAt: (res.detail.createdAt === undefined) ? '' : res.detail.createdAt,
                            pickupLocation: res.location[0].address,
                            receiveLocation: res.location[1].address
                        });
                    }

                    $scope.page++;
                }
            }, function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        if ($scope.first === true) {
            LoadMainRequest();
        }

        $scope.goDetail = function (workingRequests) {
            $location.path("/tab/requestDetail/" + workingRequests.requestId);
        }
    })

    .controller('ChanceCtrl', function ($scope, $location, $rootScope, GlobalTpl) {
        $scope.chances = [];
        $scope.page = 1;
        $scope.moreDataCanBeLoaded = false;
        $scope.first = true;

        $scope.doRefresh = function () {
            $scope.first = false;
            $scope.page = 1;
            $scope.chances = [];
            LoadMainRequest();
        };

        $scope.loadMoreData = function () {
            LoadMainRequest();
        };

        $scope.loadData = function () {
            $scope.chances = [];
            $scope.page = 1;
            LoadMainRequest();
            $scope.first = false;
        }

        function LoadMainRequest() {
            var options = {
                showLoad: true,
                showAlert: true,
                method: 'get',
                url: $rootScope.config.url + "/requests?page=" + $scope.page
            };

            GlobalTpl.request(options, function (response) {
                // Check there is existing data to load
                $scope.moreDataCanBeLoaded =
                    (response && response.data && response.data.length > 0) ? true : false;

                if (response.data && response.data.length > 0) {
                    // Fetch new requests
                    for (var i in response.data) {
                        var res = response.data[i];
                        $scope.chances.push({
                            requestId: res.detail.id,
                            description: res.detail.description,
                            clientPhone: res.client.phone,
                            createdAt: (res.detail.createdAt === undefined) ? '' : res.detail.createdAt,
                            pickupLocation: res.location[0].address,
                            receiveLocation: res.location[1].address
                        });
                    }

                    $scope.page++;
                }
            }, function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        if ($scope.first === true) {
            LoadMainRequest();
        }

        $scope.goDetail = function (chance) {
            $location.path("/tab/requestDetail/" + chance.requestId);
        }
    })

    .controller('HistoryCtrl', function ($scope, $location, $rootScope, GlobalTpl) {
        $scope.values = [{
            id: 0,
            name: 'Tất cả',
            type: "all"
        }, {
            id: 1,
            name: 'Giao dịch thành công',
            type: "success"
        }, {
            id: 2,
            name: 'Giao dịch thất bại',
            type: "fail"
        }];

        $scope.selected = $scope.values[0];
        $scope.historyRequests = [];
        $scope.page = 1;
        $scope.moreDataCanBeLoaded = false;
        $scope.type = 'all';
        $scope.first = true;

        $scope.doRefresh = function () {
            $scope.first = false;
            $scope.page = 1;
            $scope.historyRequests = [];
            LoadMainRequest($scope.type);
        };

        $scope.loadMoreData = function () {
            LoadMainRequest($scope.type);
        };

        $scope.loadData = function (type) {
            $scope.historyRequests = [];
            $scope.page = 1;
            $scope.type = type;
            LoadMainRequest(type);
            $scope.first = false;
        }

        function LoadMainRequest(type) {
            var options = {
                showLoad: true,
                showAlert: true,
                method: 'get',
                url: $rootScope.config.url + "/drivers/"
                + window.localStorage['driverId'] + "/transactions?page="
                + $scope.page + "&type=" + type
            };

            GlobalTpl.request(options, function (response) {
                // Check there is existing data to load
                $scope.moreDataCanBeLoaded =
                    (response && response.data && response.data.length > 0) ? true : false;

                if (response.data && response.data.length > 0) {

                    // Fetch new requests
                    for (var i in response.data) {
                        var res = response.data[i];
                        $scope.historyRequests.push({
                            requestId: res.detail.id,
                            description: res.detail.description,
                            requestStatus: res.detail.status,
                            createdAt: (res.detail.createdAt === undefined) ? '' : res.detail.createdAt,
                            pickupLocation: res.location[0].address,
                            receiveLocation: res.location[1].address
                        });
                    }
                    $scope.page++;
                }
            }, function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        if ($scope.first === true) {
            LoadMainRequest($scope.type);
        }
        $scope.goDetail = function (historyRequest) {
            $location.path("/tab/requestDetail/" + historyRequest.requestId);
        }
    })

    .controller('RequestDetailCtrl', function ($scope, $stateParams, $rootScope, $http, GlobalTpl, $ionicModal) {
        $scope.id = $stateParams.id;
        $scope.requestDetail = {};
        $scope.biddedChances = [];
        var serializedBiddedChances;

        if (window.localStorage['biddedChances'] !== undefined) {
            serializedBiddedChances = window.localStorage["biddedChances"];
            $scope.biddedChances = JSON.parse(serializedBiddedChances);
        }

        if ($scope.biddedChances.indexOf($scope.id) != -1) {
            $scope.isDisableBid = true;
        } else {
            $scope.isDisableBid = false;
        }

        $ionicModal.fromTemplateUrl('templates/sendBid.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.bidModal = modal;
        });

        $scope.newBid = function () {
            $scope.bidModal.show();
        };

        // Close the new task modal
        $scope.closeNewBid = function () {
            $scope.bidModal.hide();
        };

        $scope.sendBidForm = {
            price: '',
            transportAt: '',
            transportMethod: '',
            paymentMethod: '',
            moreInfo: ''
        };

        function validForm() {
            if (!$scope.sendBidForm.price || typeof $scope.sendBidForm.price === 'undefined' || !$scope.sendBidForm.transportAt || typeof $scope.sendBidForm.transportAt === 'undefined') {
                return false;
            }
            return true;
        }

        $scope.sendBid = function (sendBidForm) {
            if (!validForm()) {
                $scope.formWarning = "Vui lòng nhập báo giá và thời điểm giao hàng";
            } else {
                $scope.formWarning = "";
                $scope.data = {
                    driverId: 1,
                    requestId: $scope.id,
                    price: $scope.sendBidForm.price,
                    transportAt: $scope.sendBidForm.transportAt,
                    transportMethod: $scope.sendBidForm.transportMethod,
                    paymentMethod: $scope.sendBidForm.paymentMethod,
                    moreInfo: $scope.sendBidForm.moreInfo
                }
                var data = JSON.stringify($scope.data);
                var options = {
                    showLoad: true,
                    method: 'post',
                    url: $rootScope.config.url + '/bids',
                    data: data,
                    headers: {
                        'Content-Type': undefined
                    }
                };
                GlobalTpl.showLoading();
                $http(options).success(function (response) {
                    $scope.biddedChances.push($scope.id);
                    window.localStorage["biddedChances"] = JSON.stringify($scope.biddedChances);
                    $scope.isDisableBid = true;
                    GlobalTpl.hideLoading();
                    GlobalTpl.showAlert({template: "Gửi báo giá thành công"});
                    $scope.closeNewBid();
                }).error(function () {
                    GlobalTpl.hideLoading();
                    GlobalTpl.showAlert({template: "Vui lòng thử lại"});
                }).finally(function () {
                    GlobalTpl.hideLoading();
                });
            }
        };

        $scope.doRefresh = function () {
            $scope.requestDetail = {};
            LoadDetail();
        };

        $scope.getGender = function (id) {
            if (id === "1") {
                return "Nam";
            } else {
                return "Nữ";
            }
        };
        $scope.getVehicles = function (id) {
            if (id === "0") {
                return "Xe tải";
            } else if (id === "1") {
                return "Xe có cẩu";
            } else if (id === "2") {
                return "Xe container";
            }
        }
        function LoadDetail() {
            var options = {
                method: 'get',
                url: $rootScope.config.url + "/requests/" + $scope.id
            };

            GlobalTpl.request(options, function (response) {
                // Check there is existing data to load

                if (response.data && response.data !== null) {

                    // Fetch new requests
                    var res = response.data;

                    $scope.requestDetail.pickupAddress = res.location[0].address;
                    $scope.requestDetail.receiveAddress = res.location[1].address;
                    $scope.requestDetail.time = res.detail.createdAt;
                    $scope.requestDetail.description = res.detail.description;
                    $scope.requestDetail.vehicleType = res.detail.vehicleType;
                    $scope.requestDetail.weight = res.detail.weight;
                    $scope.requestDetail.length = res.detail.length;
                    $scope.requestDetail.width = res.detail.width;
                    $scope.requestDetail.height = res.detail.height;
                    $scope.requestDetail.feature = res.detail.feature;
                    $scope.requestDetail.receiverName = res.detail.receiverName;
                    $scope.requestDetail.receiverGender = res.detail.receiverGender;
                    $scope.requestDetail.receiverDatetime = res.location[1].time;
                    $scope.requestDetail.receiverPhone = res.detail.receiverPhone;
                    $scope.requestDetail.stuffImagePath = res.detail.stuffImagePath;
                    $scope.requestDetail.receiverImagePath = res.detail.receiverImagePath;
                    $scope.requestDetail.receiverIdentify = res.detail.receiverIdentify;
                }
            }, function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        LoadDetail();
    })

    .controller('ProfileCtrl', function ($scope, $state, GlobalTpl, $rootScope) {
        $scope.profile = '';
        $scope.requests = [];
        $scope.page = 1;
        $scope.moreDataCanBeLoaded = false;

        $scope.get = function (rate) {
            if (rate === '1') {
                return "img/5stars/1.png";
            } else if (rate === '2') {
                return "img/5stars/2.png";
            } else if (rate === '3') {
                return "img/5stars/3.png";
            } else if (rate === '4') {
                return "img/5stars/4.png";
            } else if (rate === '5') {
                return "img/5stars/5.png";
            }
        }

        $scope.loadMoreData = function () {
            LoadDriverRequest({
                showLoad: false,
                showAlert: false
            });
        };

        $scope.doRefresh = function () {
            $scope.page = 1;
            $scope.requests = [];
            $scope.profile = '';
            LoadMainRequest();
            LoadDriverRequest();
        };

        function LoadMainRequest() {
            var options = {
                method: 'get',
                //url: $rootScope.config.url + "/drivers/" + window.localStorage['driverId']
                url: $rootScope.config.url + "/drivers/" + "1"
            }

            GlobalTpl.request(options, function (response) {
                // Check there is existing data to load

                if (response.data && response.data !== null) {
                    var res = response.data;
                    $scope.profile = {
                        id: res.id,
                        username: res.username,
                        fullName: res.fullName,
                        phoneNumber: res.phone,
                        email: res.email,
                        deviceId: res.deviceId,
                        avatarPath: res.avatarPath,
                        identifyCard: res.identifyCard,
                        identifyCardDate: res.identifyCardDate.substring(0, 10),
                        identifyCardPlace: res.identifyCardPlace,
                        identifyCardFront: res.identifyCardFront,
                        identifyCardBack: res.identifyCardBack,
                        starRating: res.rating,
                        numTransactions: res.numTransactions,
                        numSuccessTransactions: res.numSuccessTransactions,
                        license: res.license,
                        licenseType: res.licenseType,
                        licenseStart: res.licenseStart.substring(0, 10),
                        licenseEnd: res.licenseEnd.substring(0, 10),
                        minWeight: res.minWeight,
                        maxWeight: res.maxWeight,
                        sex: (res.sex = 1) ? "Nam" : "Nữ",
                        coin: res.coin
                    };
                }
            }, function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        function LoadDriverRequest(opts) {
            opts = (typeof opts !== 'undefined') ? opts : {};

            var options = {
                showLoad: (typeof opts.showLoad === 'undefined') ? true : opts.showLoad,
                showAlert: (typeof opts.showAlert === 'undefined') ? true : opts.showAlert,
                method: (typeof opts.method === 'undefined') ? 'get' : opts.method,
                url: (typeof opts.url === 'undefined')
                    ? ($rootScope.config.url + "/driver_rates/" + 1 + "?page=" + $scope.page)
                    : opts.url
            };

            GlobalTpl.request(options, function (response) {
                // Check there is existing data to load
                $scope.moreDataCanBeLoaded =
                    (response && response.data && response.data.length > 0) ? true : false;

                if (response.data && response.data !== null) {

                    // Fetch new requests
                    for (var i in response.data) {
                        var res = response.data[i];

                        $scope.requests.push({
                            fullName: res.fullName,
                            time: res.createdAt,
                            rating: res.rating,
                            comment: res.comment,
                            updateTime: res.updateAt
                        });
                    }

                    $scope.page++;
                }
            }, function () {
                // Stop the ion-refresher from spinning
                $scope.$broadcast('scroll.refreshComplete');
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        }

        LoadMainRequest();
        LoadDriverRequest();

        $scope.next = function () {
            $state.go("tab.profileEdit");
        }
    })