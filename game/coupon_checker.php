<?php
// --- IMPORTANT: CONFIGURE YOUR DATABASE DETAILS HERE ---
$db_host = "sql5.freesqldatabase.com";
$db_name = "sql5790708";
$db_user = "sql5790708";
$db_pass = "1kvQ7gNkxt";
$db_table = "coupons"; // The name of your table

// --- Response Setup ---
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *"); // For development. For production, restrict this to your domain.
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// --- Database Connection ---
try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    // Set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    // If connection fails, send a generic error
    echo json_encode(["success" => false, "message" => "Database connection error."]);
    exit();
}

// --- Input Handling ---
// Get the JSON POSTed by the frontend
$json_data = file_get_contents('php://input');
$data = json_decode($json_data);

// Check if code exists
if (!isset($data->code) || empty($data->code)) {
    echo json_encode(["success" => false, "message" => "No coupon code provided."]);
    exit();
}

$user_code = $data->code;

// --- Database Logic ---
try {
    // 1. Find the matching code
    $stmt = $conn->prepare("SELECT * FROM $db_table WHERE adcode = :adcode");
    $stmt->bindParam(':adcode', $user_code);
    $stmt->execute();

    // Set the resulting array to associative
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($result) {
        // Code found, now check if it's redeemed
        if (strtoupper($result['redeemed']) === 'YES') {
            echo json_encode(["success" => false, "message" => "This coupon has already been found."]);
        } else {
            // Code is valid and not redeemed, so show success and update the database
            $image_url = $result['imageurl'];
            
            // 2. Update the 'redeemed' status to 'YES'
            $update_stmt = $conn->prepare("UPDATE $db_table SET redeemed = 'YES' WHERE adcode = :adcode");
            $update_stmt->bindParam(':adcode', $user_code);
            $update_stmt->execute();

            echo json_encode(["success" => true, "imageUrl" => $image_url]);
        }
    } else {
        // Code not found in the database
        echo json_encode(["success" => false, "message" => "Invalid coupon code. Try again!"]);
    }

} catch(PDOException $e) {
    echo json_encode(["success" => false, "message" => "An error occurred while checking the code."]);
}

// Close the connection
$conn = null;

?>
