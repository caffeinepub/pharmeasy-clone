import Map "mo:core/Map";
import List "mo:core/List";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";
import Storage "blob-storage/Storage";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type ProductId = Text;
  type UserId = Text;
  type OrderId = Text;
  type LabTestId = Text;
  type ArticleId = Text;
  type HealthPackageId = Text;

  type Product = {
    id : ProductId;
    name : Text;
    category : Text;
    description : Text;
    price : Nat;
    discountedPrice : ?Nat;
    imageUrl : Text;
    manufacturer : Text;
    requiresPrescription : Bool;
    stockCount : Nat;
    ratings : [Nat];
  };

  type Address = {
    street : Text;
    city : Text;
    state : Text;
    zip : Text;
    country : Text;
  };

  // UserProfile type as required by instructions
  type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    addresses : [Address];
  };

  type User = {
    id : UserId;
    principal : Principal;
    name : Text;
    email : Text;
    phone : Text;
    addresses : [Address];
  };

  type OrderItem = {
    product : Product;
    quantity : Nat;
  };

  type OrderStatus = {
    #placed;
    #processing;
    #shipped;
    #delivered;
  };

  type Order = {
    id : OrderId;
    userId : UserId;
    items : [OrderItem];
    totalAmount : Nat;
    status : OrderStatus;
    createdAt : Time.Time;
    deliveryAddress : Address;
  };

  type PrescriptionStatus = {
    #pending;
    #approved;
    #rejected;
  };

  type Prescription = {
    id : Text;
    userId : UserId;
    orderId : OrderId;
    image : Storage.ExternalBlob;
    uploadedAt : Time.Time;
    status : PrescriptionStatus;
  };

  type LabTest = {
    id : LabTestId;
    name : Text;
    description : Text;
    imageUrl : Text;

    // New fields from requirements
    testParameters : [Text];
    marketPrice : Nat;
    discountedPrice : Nat;
    sampleType : Text;
    turnaroundTime : Text;
  };

  type LabTestBooking = {
    id : Text;
    userId : UserId;
    labTestId : LabTestId;
    appointmentTime : Time.Time;
    createdAt : Time.Time;
  };

  type HealthPackage = {
    id : HealthPackageId;
    name : Text;
    description : Text;
    includedTests : [Text];
    testParameters : [Text];
    marketPrice : Nat;
    discountedPrice : Nat;
    imageUrl : Text;
    sampleType : Text;
    turnaroundTime : Text;
    isPopular : Bool;
  };

  type Article = {
    id : ArticleId;
    title : Text;
    excerpt : Text;
    content : Text;
    author : Text;
    date : Time.Time;
    imageUrl : Text;
  };

  module Product {
    public func compareByPriceLowHigh(p1 : Product, p2 : Product) : Order.Order {
      compareProductsByPrice(p1, p2, false);
    };

    public func compareByPriceHighLow(p1 : Product, p2 : Product) : Order.Order {
      compareProductsByPrice(p1, p2, true);
    };

    func compareProductsByPrice(p1 : Product, p2 : Product, reverse : Bool) : Order.Order {
      let price1 = switch (p1.discountedPrice, p1.price) {
        case (?discounted, _) { discounted };
        case (null, fullPrice) { fullPrice };
      };
      let price2 = switch (p2.discountedPrice, p2.price) {
        case (?discounted, _) { discounted };
        case (null, fullPrice) { fullPrice };
      };
      if (reverse) {
        Nat.compare(price2, price1);
      } else {
        Nat.compare(price1, price2);
      };
    };
  };

  var nextProductId = 1;
  var nextOrderId = 1;
  var nextLabTestId = 1;
  var nextBookingId = 1;
  var nextHealthPackageId = 1;

  let products = Map.empty<ProductId, Product>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let users = Map.empty<UserId, User>();
  let orders = Map.empty<OrderId, Order>();
  let prescriptions = Map.empty<Text, Prescription>();
  let labTests = Map.empty<LabTestId, LabTest>();
  let labTestBookings = Map.empty<Text, LabTestBooking>();
  let articles = Map.empty<ArticleId, Article>();
  let healthPackages = Map.empty<HealthPackageId, HealthPackage>();

  func generateProductId() : ProductId {
    let newId = nextProductId;
    nextProductId += 1;
    newId.toText();
  };

  func generateOrderId() : OrderId {
    let newId = nextOrderId;
    nextOrderId += 1;
    newId.toText();
  };

  func generateLabTestId() : LabTestId {
    let newId = nextLabTestId;
    nextLabTestId += 1;
    newId.toText();
  };

  func generateBookingId() : Text {
    let newId = nextBookingId;
    nextBookingId += 1;
    newId.toText();
  };

  func generateHealthPackageId() : HealthPackageId {
    let newId = nextHealthPackageId;
    nextHealthPackageId += 1;
    newId.toText();
  };

  func seedProducts() {
    let sampleProducts : [Product] = [
      {
        id = generateProductId();
        name = "Paracetamol 500mg";
        category = "Pain Relief";
        description = "Effective pain and fever reducer";
        price = 100;
        discountedPrice = ?80;
        imageUrl = "https://example.com/paracetamol.jpg";
        manufacturer = "HealthCorp";
        requiresPrescription = false;
        stockCount = 150;
        ratings = [5, 4, 4, 5, 3];
      },
      {
        id = generateProductId();
        name = "Cough Syrup";
        category = "Cold & Flu";
        description = "Relieves cough and soothes throat";
        price = 250;
        discountedPrice = null;
        imageUrl = "https://example.com/cough_syrup.jpg";
        manufacturer = "Wellness Pharma";
        requiresPrescription = false;
        stockCount = 80;
        ratings = [4, 4, 3, 5, 5];
      },
      {
        id = generateProductId();
        name = "Vitamin C Tablets";
        category = "Supplements";
        description = "Boosts immunity and energy levels";
        price = 150;
        discountedPrice = ?120;
        imageUrl = "https://example.com/vitamin_c.jpg";
        manufacturer = "VitalLiving";
        requiresPrescription = false;
        stockCount = 200;
        ratings = [5, 5, 4, 5, 4];
      },
      {
        id = generateProductId();
        name = "Blood Pressure Medicine";
        category = "Prescription Medication";
        description = "Helps manage high blood pressure";
        price = 500;
        discountedPrice = ?450;
        imageUrl = "https://example.com/bp_medicine.jpg";
        manufacturer = "CardioCare";
        requiresPrescription = true;
        stockCount = 50;
        ratings = [4, 5, 4, 3, 5];
      },
      {
        id = generateProductId();
        name = "Insulin Injection";
        category = "Diabetes Care";
        description = "Essential for diabetes management";
        price = 600;
        discountedPrice = null;
        imageUrl = "https://example.com/insulin.jpg";
        manufacturer = "Diabetes Solutions";
        requiresPrescription = true;
        stockCount = 30;
        ratings = [5, 4, 4, 5, 4];
      },
      {
        id = generateProductId();
        name = "Allergy Relief Tablets";
        category = "Allergy Relief";
        description = "Fast-acting allergy relief";
        price = 200;
        discountedPrice = ?180;
        imageUrl = "https://example.com/allergy_tabs.jpg";
        manufacturer = "AllergyMed";
        requiresPrescription = false;
        stockCount = 120;
        ratings = [4, 5, 4, 4, 5];
      },
      {
        id = generateProductId();
        name = "Calcium Supplements";
        category = "Supplements";
        description = "Supports bone health";
        price = 180;
        discountedPrice = ?150;
        imageUrl = "https://example.com/calcium.jpg";
        manufacturer = "Wellness Pharma";
        requiresPrescription = false;
        stockCount = 180;
        ratings = [5, 4, 4, 5, 5];
      },
      {
        id = generateProductId();
        name = "Antibiotic Ointment";
        category = "First Aid";
        description = "Prevents infection in minor wounds";
        price = 300;
        discountedPrice = null;
        imageUrl = "https://example.com/antibiotic_ointment.jpg";
        manufacturer = "MediSafe";
        requiresPrescription = false;
        stockCount = 60;
        ratings = [4, 4, 5, 4, 3];
      },
      {
        id = generateProductId();
        name = "Sleep Aid";
        category = "Sleep & Stress";
        description = "Promotes restful sleep";
        price = 350;
        discountedPrice = ?320;
        imageUrl = "https://example.com/sleep_aid.jpg";
        manufacturer = "CalmLife";
        requiresPrescription = false;
        stockCount = 90;
        ratings = [5, 5, 4, 4, 5];
      },
      {
        id = generateProductId();
        name = "Children's Multivitamins";
        category = "Children's Health";
        description = "Complete daily vitamins for kids";
        price = 220;
        discountedPrice = ?200;
        imageUrl = "https://example.com/kids_vitamins.jpg";
        manufacturer = "VitalLiving";
        requiresPrescription = false;
        stockCount = 130;
        ratings = [4, 5, 4, 5, 4];
      },
      {
        id = generateProductId();
        name = "Cholesterol Medication";
        category = "Prescription Medication";
        description = "Helps lower cholesterol levels";
        price = 450;
        discountedPrice = ?400;
        imageUrl = "https://example.com/cholesterol_meds.jpg";
        manufacturer = "CardioCare";
        requiresPrescription = true;
        stockCount = 45;
        ratings = [5, 4, 5, 4, 4];
      },
      {
        id = generateProductId();
        name = "Eye Drops";
        category = "Eye Care";
        description = "Relieves dry and irritated eyes";
        price = 120;
        discountedPrice = null;
        imageUrl = "https://example.com/eye_drops.jpg";
        manufacturer = "HealthVision";
        requiresPrescription = false;
        stockCount = 75;
        ratings = [4, 5, 4, 5, 3];
      },
      {
        id = generateProductId();
        name = "Joint Support Capsules";
        category = "Supplements";
        description = "Supports joint health and mobility";
        price = 280;
        discountedPrice = ?250;
        imageUrl = "https://example.com/joint_support.jpg";
        manufacturer = "Wellness Pharma";
        requiresPrescription = false;
        stockCount = 110;
        ratings = [5, 4, 5, 4, 5];
      },
      {
        id = generateProductId();
        name = "Antacid Tablets";
        category = "Digestive Health";
        description = "Fast relief from heartburn";
        price = 160;
        discountedPrice = ?140;
        imageUrl = "https://example.com/antacid.jpg";
        manufacturer = "DigestiCare";
        requiresPrescription = false;
        stockCount = 140;
        ratings = [4, 5, 4, 5, 4];
      },
      {
        id = generateProductId();
        name = "Thermometer";
        category = "Medical Devices";
        description = "Accurate body temperature readings";
        price = 350;
        discountedPrice = ?330;
        imageUrl = "https://example.com/thermometer.jpg";
        manufacturer = "MediSafe";
        requiresPrescription = false;
        stockCount = 55;
        ratings = [5, 4, 5, 4, 5];
      },
      {
        id = generateProductId();
        name = "Face Masks (Pack of 50)";
        category = "Personal Protection";
        description = "Disposable protective masks";
        price = 500;
        discountedPrice = ?450;
        imageUrl = "https://example.com/face_masks.jpg";
        manufacturer = "HealthSafe";
        requiresPrescription = false;
        stockCount = 300;
        ratings = [4, 5, 4, 4, 5];
      },
      {
        id = generateProductId();
        name = "Hand Sanitizer";
        category = "Personal Care";
        description = "Antibacterial hand gel";
        price = 100;
        discountedPrice = null;
        imageUrl = "https://example.com/sanitizer.jpg";
        manufacturer = "CleanSafe";
        requiresPrescription = false;
        stockCount = 190;
        ratings = [5, 5, 4, 4, 4];
      },
      {
        id = generateProductId();
        name = "Antiseptic Cream";
        category = "First Aid";
        description = "Prevents infection in cuts";
        price = 220;
        discountedPrice = ?200;
        imageUrl = "https://example.com/antiseptic_cream.jpg";
        manufacturer = "MediSafe";
        requiresPrescription = false;
        stockCount = 80;
        ratings = [4, 5, 4, 5, 3];
      },
      {
        id = generateProductId();
        name = "Energy Boost Drink";
        category = "Supplements";
        description = "Instant energy and hydration";
        price = 180;
        discountedPrice = ?150;
        imageUrl = "https://example.com/energy_drink.jpg";
        manufacturer = "VitalLiving";
        requiresPrescription = false;
        stockCount = 160;
        ratings = [5, 4, 5, 4, 5];
      },
      {
        id = generateProductId();
        name = "Mosquito Repellent";
        category = "Personal Care";
        description = "Protects against mosquito bites";
        price = 140;
        discountedPrice = ?120;
        imageUrl = "https://example.com/repellent.jpg";
        manufacturer = "HealthSafe";
        requiresPrescription = false;
        stockCount = 110;
        ratings = [4, 5, 4, 5, 4];
      },
    ];

    for (product in sampleProducts.values()) {
      products.add(product.id, product);
    };
  };

  func seedLabTests() {
    let sampleLabTests : [LabTest] = [
      {
        id = generateLabTestId();
        name = "Complete Blood Count (CBC)";
        description = "Comprehensive blood analysis for health assessment";
        testParameters = [
          "Hemoglobin",
          "Red Blood Cells (RBC)",
          "White Blood Cells (WBC)",
          "Platelet Count"
        ];
        marketPrice = 800;
        discountedPrice = 320;
        sampleType = "Blood";
        turnaroundTime = "24 hours";
        imageUrl = "https://example.com/cbc.jpg";
      },
      {
        id = generateLabTestId();
        name = "Lipid Profile";
        description = "Cholesterol and triglyceride measurement";
        testParameters = [
          "Total Cholesterol",
          "HDL",
          "LDL",
          "Triglycerides"
        ];
        marketPrice = 1000;
        discountedPrice = 400;
        sampleType = "Blood";
        turnaroundTime = "48 hours";
        imageUrl = "https://example.com/lipid_profile.jpg";
      },
      {
        id = generateLabTestId();
        name = "Liver Function Test (LFT)";
        description = "Assessment of liver health";
        testParameters = [
          "Bilirubin",
          "ALT",
          "AST",
          "Alkaline Phosphatase"
        ];
        marketPrice = 1200;
        discountedPrice = 480;
        sampleType = "Blood";
        turnaroundTime = "36 hours";
        imageUrl = "https://example.com/liver_function.jpg";
      },
      {
        id = generateLabTestId();
        name = "Renal Function Test (RFT)";
        description = "Kidney health evaluation";
        testParameters = [
          "Creatinine",
          "Urea",
          "Uric Acid",
          "Electrolytes"
        ];
        marketPrice = 1100;
        discountedPrice = 440;
        sampleType = "Blood";
        turnaroundTime = "30 hours";
        imageUrl = "https://example.com/renal_function.jpg";
      },
      {
        id = generateLabTestId();
        name = "Blood Sugar Test";
        description = "Glucose level measurement";
        testParameters = [
          "Fasting Blood Sugar",
          "Postprandial Blood Sugar"
        ];
        marketPrice = 600;
        discountedPrice = 240;
        sampleType = "Blood";
        turnaroundTime = "12 hours";
        imageUrl = "https://example.com/blood_sugar.jpg";
      },
      {
        id = generateLabTestId();
        name = "Thyroid Function Test (TFT)";
        description = "Thyroid health assessment";
        testParameters = [
          "TSH",
          "T3",
          "T4"
        ];
        marketPrice = 950;
        discountedPrice = 380;
        sampleType = "Blood";
        turnaroundTime = "24 hours";
        imageUrl = "https://example.com/thyroid_function.jpg";
      },
      {
        id = generateLabTestId();
        name = "Uric Acid Test";
        description = "Gout and kidney health assessment";
        testParameters = [
          "Uric Acid"
        ];
        marketPrice = 500;
        discountedPrice = 200;
        sampleType = "Blood";
        turnaroundTime = "18 hours";
        imageUrl = "https://example.com/uric_acid.jpg";
      },
      {
        id = generateLabTestId();
        name = "Calcium Test";
        description = "Bone health evaluation";
        testParameters = [
          "Calcium"
        ];
        marketPrice = 400;
        discountedPrice = 160;
        sampleType = "Blood";
        turnaroundTime = "15 hours";
        imageUrl = "https://example.com/calcium_test.jpg";
      },
      {
        id = generateLabTestId();
        name = "Vitamin D Test";
        description = "Vitamin D level measurement";
        testParameters = [
          "Vitamin D, 25-Hydroxy"
        ];
        marketPrice = 850;
        discountedPrice = 340;
        sampleType = "Blood";
        turnaroundTime = "20 hours";
        imageUrl = "https://example.com/vitamin_d.jpg";
      },
      {
        id = generateLabTestId();
        name = "Urine Routine Test";
        description = "Assessment of urinary tract health";
        testParameters = [
          "Physical Examination",
          "Chemical Analysis",
          "Microscopic Examination"
        ];
        marketPrice = 400;
        discountedPrice = 160;
        sampleType = "Urine";
        turnaroundTime = "10 hours";
        imageUrl = "https://example.com/urine_test.jpg";
      },
    ];

    for (labTest in sampleLabTests.values()) {
      labTests.add(labTest.id, labTest);
    };
  };

  func seedHealthPackages() {
    let sampleHealthPackages : [HealthPackage] = [
      {
        id = generateHealthPackageId();
        name = "Full Body Checkup";
        description = "Comprehensive health screening with blood and urine tests";
        includedTests = [
          "Complete Blood Count (CBC)",
          "Lipid Profile",
          "Liver Function Test (LFT)",
          "Renal Function Test (RFT)",
          "Blood Sugar Test"
        ];
        testParameters = [
          "Hemoglobin",
          "RBC",
          "WBC",
          "Platelet Count",
          "Total Cholesterol",
          "HDL",
          "LDL",
          "Triglycerides",
          "Bilirubin",
          "ALT",
          "AST",
          "Alkaline Phosphatase",
          "Creatinine",
          "Urea",
          "Uric Acid",
          "Electrolytes",
          "Fasting Blood Sugar",
          "Postprandial Blood Sugar"
        ];
        marketPrice = 4000;
        discountedPrice = 1600;
        imageUrl = "https://example.com/full_body_checkup.jpg";
        sampleType = "Blood, Urine";
        turnaroundTime = "48 hours";
        isPopular = true;
      },
      {
        id = generateHealthPackageId();
        name = "Diabetes Panel";
        description = "Tests for monitoring diabetes and related health parameters";
        includedTests = [
          "Blood Sugar Test",
          "Lipid Profile",
          "Renal Function Test (RFT)"
        ];
        testParameters = [
          "Fasting Blood Sugar",
          "Postprandial Blood Sugar",
          "Total Cholesterol",
          "HDL",
          "LDL",
          "Triglycerides",
          "Creatinine",
          "Urea",
          "Uric Acid",
          "Electrolytes"
        ];
        marketPrice = 2800;
        discountedPrice = 1120;
        imageUrl = "https://example.com/diabetes_panel.jpg";
        sampleType = "Blood";
        turnaroundTime = "36 hours";
        isPopular = true;
      },
      {
        id = generateHealthPackageId();
        name = "Thyroid Profile";
        description = "Comprehensive thyroid health assessment";
        includedTests = [
          "Thyroid Function Test (TFT)",
          "Calcium Test"
        ];
        testParameters = [
          "TSH",
          "T3",
          "T4",
          "Calcium"
        ];
        marketPrice = 1550;
        discountedPrice = 620;
        imageUrl = "https://example.com/thyroid_profile.jpg";
        sampleType = "Blood";
        turnaroundTime = "24 hours";
        isPopular = false;
      },
      {
        id = generateHealthPackageId();
        name = "Liver Function";
        description = "Evaluation of liver health and function";
        includedTests = [
          "Liver Function Test (LFT)",
          "Uric Acid Test"
        ];
        testParameters = [
          "Bilirubin",
          "ALT",
          "AST",
          "Alkaline Phosphatase",
          "Uric Acid"
        ];
        marketPrice = 1700;
        discountedPrice = 680;
        imageUrl = "https://example.com/liver_function.jpg";
        sampleType = "Blood";
        turnaroundTime = "30 hours";
        isPopular = false;
      },
      {
        id = generateHealthPackageId();
        name = "Heart Health";
        description = "Comprehensive cardiovascular risk assessment";
        includedTests = [
          "Lipid Profile",
          "Blood Sugar Test"
        ];
        testParameters = [
          "Total Cholesterol",
          "HDL",
          "LDL",
          "Triglycerides",
          "Fasting Blood Sugar",
          "Postprandial Blood Sugar"
        ];
        marketPrice = 1600;
        discountedPrice = 640;
        imageUrl = "https://example.com/heart_health.jpg";
        sampleType = "Blood";
        turnaroundTime = "24 hours";
        isPopular = true;
      },
      {
        id = generateHealthPackageId();
        name = "Women's Wellness";
        description = "Tailored health screening for women including wellness tests";
        includedTests = [
          "Complete Blood Count (CBC)",
          "Lipid Profile",
          "Thyroid Function Test (TFT)"
        ];
        testParameters = [
          "Hemoglobin",
          "RBC",
          "WBC",
          "Platelet Count",
          "Total Cholesterol",
          "HDL",
          "LDL",
          "Triglycerides",
          "TSH",
          "T3",
          "T4"
        ];
        marketPrice = 3400;
        discountedPrice = 1360;
        imageUrl = "https://example.com/womens_wellness.jpg";
        sampleType = "Blood";
        turnaroundTime = "36 hours";
        isPopular = true;
      },
    ];

    for (healthPackage in sampleHealthPackages.values()) {
      healthPackages.add(healthPackage.id, healthPackage);
    };
  };

  func seedArticles() {
    let currentTime = Time.now();

    let sampleArticles : [Article] = [
      {
        id = "1";
        title = "10 Tips for a Healthy Lifestyle";
        excerpt = "Adopting a healthy lifestyle is easier than you think. Here are 10 simple steps to get started.";
        content = "Maintaining a healthy lifestyle involves regular exercise, balanced nutrition, adequate sleep, ...";
        author = "Dr. Jane Smith";
        date = currentTime;
        imageUrl = "https://example.com/healthy_lifestyle.jpg";
      },
      {
        id = "2";
        title = "Understanding Diabetes: Causes and Management";
        excerpt = "Diabetes is a common condition that requires careful management. Learn about the causes, symptoms, ...";
        content = "Diabetes is a chronic condition characterized by high blood sugar levels. It can be managed with ...";
        author = "Dr. John Doe";
        date = currentTime;
        imageUrl = "https://example.com/diabetes.jpg";
      },
      {
        id = "3";
        title = "Benefits of Regular Exercise";
        excerpt = "Exercise offers numerous health benefits beyond weight loss. Discover how it can improve your life.";
        content = "Regular physical activity helps control weight, strengthens muscles, boosts mood, and reduces the risk of chronic ...";
        author = "Fitness Expert Mary Johnson";
        date = currentTime;
        imageUrl = "https://example.com/exercise.jpg";
      },
      {
        id = "4";
        title = "Healthy Eating on a Budget";
        excerpt = "Eating healthy doesn't have to be expensive. Learn how to make nutritious choices without breaking the bank.";
        content = "Smart shopping, meal planning, and preparing meals at home are great ways to eat healthy on a budget.";
        author = "Nutritionist Tom Lee";
        date = currentTime;
        imageUrl = "https://example.com/healthy_eating.jpg";
      },
      {
        id = "5";
        title = "Managing Stress Naturally";
        excerpt = "Chronic stress can impact your health. Discover natural ways to manage stress and improve well-being.";
        content = "Stress management techniques like mindfulness, meditation, and healthy lifestyle habits can help reduce stress levels.";
        author = "Psychologist Susan Green";
        date = currentTime;
        imageUrl = "https://example.com/stress_management.jpg";
      },
      {
        id = "6";
        title = "Importance of Regular Health Check-Ups";
        excerpt = "Routine health check-ups are essential for early detection and prevention of diseases.";
        content = "Regular medical exams and screenings can help catch health issues early, when they're most treatable.";
        author = "Dr. Emily Brown";
        date = currentTime;
        imageUrl = "https://example.com/health_checkup.jpg";
      },
    ];

    for (article in sampleArticles.values()) {
      articles.add(article.id, article);
    };
  };

  // Admin-only: seed data
  public shared ({ caller }) func seedData() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed data");
    };

    products.clear();
    labTests.clear();
    healthPackages.clear();
    articles.clear();

    seedProducts();
    seedLabTests();
    seedHealthPackages();
    seedArticles();
  };

  // Public: anyone can search/browse products
  public query func searchProducts(
    searchTerm : Text,
    category : ?Text,
    minPrice : ?Nat,
    maxPrice : ?Nat,
    brand : ?Text,
    requiresPrescription : ?Bool,
    sortBy : ?Text,
  ) : async [Product] {
    var results = List.empty<Product>();

    for ((_, product) in products.entries()) {
      if (productMatchesSearch(product, searchTerm, category, minPrice, maxPrice, brand, requiresPrescription)) {
        results.add(product);
      };
    };

    let resultsArray = results.toArray();

    switch (sortBy) {
      case (?sort) {
        if (sort == "priceLowHigh") {
          resultsArray.sort(Product.compareByPriceLowHigh);
        } else if (sort == "priceHighLow") {
          resultsArray.sort(Product.compareByPriceHighLow);
        } else {
          resultsArray;
        };
      };
      case (null) { resultsArray };
    };
  };

  func productMatchesSearch(
    product : Product,
    searchTerm : Text,
    category : ?Text,
    minPrice : ?Nat,
    maxPrice : ?Nat,
    brand : ?Text,
    requiresPrescription : ?Bool,
  ) : Bool {
    let matchesName = product.name.contains(#text(searchTerm));
    let matchesCategory = switch (category) {
      case (?cat) { product.category == cat };
      case (null) { true };
    };
    let matchesPrice = switch (minPrice, maxPrice) {
      case (?min, ?max) {
        product.price >= min and product.price <= max;
      };
      case (?min, null) { product.price >= min };
      case (null, ?max) { product.price <= max };
      case (null, null) { true };
    };
    let matchesBrand = switch (brand) {
      case (?b) { product.manufacturer == b };
      case (null) { true };
    };
    let matchesPrescription = switch (requiresPrescription) {
      case (?req) { product.requiresPrescription == req };
      case (null) { true };
    };

    matchesName and matchesCategory and matchesPrice and matchesBrand and matchesPrescription;
  };

  // Public: anyone can view a product
  public query func getProductById(productId : ProductId) : async ?Product {
    products.get(productId);
  };

  // Public: anyone can browse by category
  public query func getProductsByCategory(category : Text) : async [Product] {
    products.values().toArray().filter(func(product) { product.category == category });
  };

  // Public: anyone can get all categories
  public query func getAllCategories() : async [Text] {
    let categories = List.empty<Text>();

    for ((_, product) in products.entries()) {
      if (not categories.any(func(cat) { cat == product.category })) {
        categories.add(product.category);
      };
    };

    categories.toArray();
  };

  // Public: anyone can get all lab tests
  public query func getAllLabTests() : async [LabTest] {
    labTests.values().toArray();
  };

  // Public: anyone can get a lab test by id
  public query func getLabTestById(labTestId : LabTestId) : async ?LabTest {
    labTests.get(labTestId);
  };

  // Public: anyone can get all health packages
  public query func getHealthPackages() : async [HealthPackage] {
    healthPackages.values().toArray();
  };

  // Public: anyone can get a specific health package by id
  public query func getHealthPackage(healthPackageId : HealthPackageId) : async ?HealthPackage {
    healthPackages.get(healthPackageId);
  };

  // Users only: upload a prescription
  public shared ({ caller }) func uploadPrescription(
    orderId : OrderId,
    prescriptionImage : Storage.ExternalBlob,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can upload prescriptions");
    };

    let userId = caller.toText();
    let prescriptionId = "prescription_" # orderId # "_" # Time.now().toText();

    let newPrescription : Prescription = {
      id = prescriptionId;
      userId;
      orderId;
      image = prescriptionImage;
      uploadedAt = Time.now();
      status = #pending;
    };

    prescriptions.add(prescriptionId, newPrescription);

    prescriptionId;
  };

  // Users only: create an order
  public shared ({ caller }) func createOrder(
    items : [OrderItem],
    totalAmount : Nat,
    deliveryAddress : Address,
    requiresPrescription : Bool,
  ) : async OrderId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create orders");
    };

    let userId = caller.toText();
    let orderId = generateOrderId();

    let newOrder : Order = {
      id = orderId;
      userId;
      items;
      totalAmount;
      status = #placed;
      createdAt = Time.now();
      deliveryAddress;
    };

    orders.add(orderId, newOrder);

    orderId;
  };

  // Users only: get orders for a specific user (caller must be that user or an admin)
  public query ({ caller }) func getOrdersByUser(userId : UserId) : async [Order] {
    if (caller.toText() != userId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };
    orders.values().toArray().filter(func(order) { order.userId == userId });
  };

  // Users only: get caller's own orders
  public query ({ caller }) func getMyOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view orders");
    };
    let userId = caller.toText();
    orders.values().toArray().filter(func(order) { order.userId == userId });
  };

  // Admin only: update order status
  public shared ({ caller }) func updateOrderStatus(orderId : OrderId, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(orderId)) {
      case (?existingOrder) {
        let updatedOrder = {
          existingOrder with status;
        };
        orders.add(orderId, updatedOrder);
      };
      case (null) { Runtime.trap("Order not found") };
    };
  };

  // Users only: book a lab test
  public shared ({ caller }) func bookLabTest(labTestId : LabTestId, appointmentTime : Time.Time) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can book lab tests");
    };

    let userId = caller.toText();
    let bookingId = generateBookingId();

    let newBooking : LabTestBooking = {
      id = bookingId;
      userId;
      labTestId;
      appointmentTime;
      createdAt = Time.now();
    };

    labTestBookings.add(bookingId, newBooking);

    bookingId;
  };

  // Users only: get caller's lab test bookings
  public query ({ caller }) func getMyLabTestBookings() : async [LabTestBooking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their bookings");
    };
    let userId = caller.toText();
    labTestBookings.values().toArray().filter(func(booking) { booking.userId == userId });
  };

  // Public: anyone can read articles
  public query func getAllArticles() : async [Article] {
    articles.values().toArray();
  };

  // Public: anyone can read an article
  public query func getArticleById(articleId : ArticleId) : async ?Article {
    articles.get(articleId);
  };

  // ---- User Profile functions as required by instructions ----

  // Users only: get the caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  // Users only: save the caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);

    // Also keep the legacy users map in sync
    let userId = caller.toText();
    let newUser : User = {
      id = userId;
      principal = caller;
      name = profile.name;
      email = profile.email;
      phone = profile.phone;
      addresses = profile.addresses;
    };
    users.add(userId, newUser);
  };

  // Caller can view their own profile; admins can view any profile
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Users only: get caller's own prescriptions
  public query ({ caller }) func getMyPrescriptions() : async [Prescription] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their prescriptions");
    };
    let userId = caller.toText();
    prescriptions.values().toArray().filter(func(p) { p.userId == userId });
  };

  // Admin only: update prescription status
  public shared ({ caller }) func updatePrescriptionStatus(prescriptionId : Text, status : PrescriptionStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update prescription status");
    };

    switch (prescriptions.get(prescriptionId)) {
      case (?existing) {
        let updated = { existing with status };
        prescriptions.add(prescriptionId, updated);
      };
      case (null) { Runtime.trap("Prescription not found") };
    };
  };

  public query func getPopularHealthPackages() : async [HealthPackage] {
    healthPackages.values().toArray().filter(func(hp) { hp.isPopular });
  };

  public query ({ caller }) func searchHealthPackages(searchTerm : Text, priceRange : ?(Nat, Nat)) : async [HealthPackage] {
    let results = List.empty<HealthPackage>();

    for ((_, package) in healthPackages.entries()) {
      if (matchesSearch(package, searchTerm, priceRange)) {
        results.add(package);
      };
    };

    results.toArray();
  };

  func matchesSearch(package : HealthPackage, searchTerm : Text, priceRange : ?(Nat, Nat)) : Bool {
    let matchesName = package.name.contains(#text(searchTerm));
    let matchesDescription = package.description.contains(#text(searchTerm));
    let matchesParams = package.testParameters.any(func(param) { param.contains(#text(searchTerm)) });
    let matchesTests = package.includedTests.any(func(test) { test.contains(#text(searchTerm)) });
    let matchesPrice = switch (priceRange) {
      case (?(min, max)) { package.discountedPrice >= min and package.discountedPrice <= max };
      case (null) { true };
    };

    (matchesName or matchesDescription or matchesParams or matchesTests) and matchesPrice
  };

  // ---- Admin Panel Backend Functions ----

  // Admin only: add a lab test
  public shared ({ caller }) func addLabTest(labTest : LabTest) : async LabTestId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add lab tests");
    };
    let newId = generateLabTestId();
    let newLabTest : LabTest = {
      labTest with id = newId;
    };
    labTests.add(newId, newLabTest);
    newId;
  };

  // Admin only: update a lab test
  public shared ({ caller }) func updateLabTest(labTestId : LabTestId, updatedLabTest : LabTest) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update lab tests");
    };
    assert (labTests.containsKey(labTestId));
    let newLabTest : LabTest = {
      updatedLabTest with id = labTestId;
    };
    labTests.add(labTestId, newLabTest);
  };

  // Admin only: delete a lab test
  public shared ({ caller }) func deleteLabTest(labTestId : LabTestId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete lab tests");
    };
    labTests.remove(labTestId);
  };

  // Admin only: add a health package
  public shared ({ caller }) func addHealthPackage(healthPackage : HealthPackage) : async HealthPackageId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add health packages");
    };
    let newId = generateHealthPackageId();
    let newHealthPackage : HealthPackage = {
      healthPackage with id = newId;
    };
    healthPackages.add(newId, newHealthPackage);
    newId;
  };

  // Admin only: update a health package
  public shared ({ caller }) func updateHealthPackage(healthPackageId : HealthPackageId, updatedPackage : HealthPackage) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update health packages");
    };
    assert (healthPackages.containsKey(healthPackageId));
    let newHealthPackage : HealthPackage = {
      updatedPackage with id = healthPackageId;
    };
    healthPackages.add(healthPackageId, newHealthPackage);
  };

  // Admin only: delete a health package
  public shared ({ caller }) func deleteHealthPackage(healthPackageId : HealthPackageId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete health packages");
    };
    healthPackages.remove(healthPackageId);
  };

  // Admin only: get all orders
  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  // Admin only: get all lab test bookings
  public query ({ caller }) func getAllBookings() : async [LabTestBooking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    labTestBookings.values().toArray();
  };

  // Admin only: get all prescriptions
  public query ({ caller }) func getAllPrescriptions() : async [Prescription] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all prescriptions");
    };
    prescriptions.values().toArray();
  };

  // Admin only: upload an image for lab tests or health packages
  public shared ({ caller }) func uploadImage(image : Storage.ExternalBlob) : async Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can upload images");
    };
    image;
  };

};
