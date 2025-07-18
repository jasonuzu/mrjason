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
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

// --- Database Connection ---
try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database connection error."]);
    exit();
}

// --- Determine Request Method ---
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Handle request to fetch all coupons
    try {
        $stmt = $conn->prepare("SELECT id, adcode, location, redeemed, imageurl FROM $db_table ORDER BY id DESC");
        $stmt->execute();
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($results);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to fetch coupons."]);
    }

} elseif ($method === 'POST') {
    // Handle requests to add, update, or delete coupons
    $data = json_decode(file_get_contents('php://input'));

    if (!isset($data->action)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "No action specified."]);
        exit();
    }

    $action = $data->action;

    try {
        switch ($action) {
            case 'add':
                $stmt = $conn->prepare("INSERT INTO $db_table (adcode, location, redeemed, imageurl) VALUES (:adcode, :location, 'NO', :imageurl)");
                $stmt->bindParam(':adcode', $data->adcode);
                $stmt->bindParam(':location', $data->location);
                $stmt->bindParam(':imageurl', $data->imageurl);
                $stmt->execute();
                echo json_encode(["success" => true, "message" => "Coupon added successfully."]);
                break;

            case 'delete':
                $stmt = $conn->prepare("DELETE FROM $db_table WHERE adcode = :adcode");
                $stmt->bindParam(':adcode', $data->adcode);
                $stmt->execute();
                echo json_encode(["success" => true, "message" => "Coupon deleted successfully."]);
                break;

            case 'toggle':
                // First, get the current status
                $fetch_stmt = $conn->prepare("SELECT redeemed FROM $db_table WHERE adcode = :adcode");
                $fetch_stmt->bindParam(':adcode', $data->adcode);
                $fetch_stmt->execute();
                $current_status = $fetch_stmt->fetchColumn();
                
                // Determine the new status
                $new_status = (strtoupper($current_status) === 'NO') ? 'YES' : 'NO';

                // Update to the new status
                $update_stmt = $conn->prepare("UPDATE $db_table SET redeemed = :redeemed WHERE adcode = :adcode");
                $update_stmt->bindParam(':redeemed', $new_status);
                $update_stmt->bindParam(':adcode', $data->adcode);
                $update_stmt->execute();
                echo json_encode(["success" => true, "message" => "Status updated successfully."]);
                break;

            default:
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Invalid action."]);
                break;
        }
    } catch(PDOException $e) {
        http_response_code(500);
        // Provide a more specific error for duplicate entry
        if ($e->errorInfo[1] == 1062) { // 1062 is the MySQL error code for duplicate entry
             echo json_encode(["success" => false, "message" => "Error: This Ad Code already exists."]);
        } else {
             echo json_encode(["success" => false, "message" => "A database error occurred: " . $e->getMessage()]);
        }
    }
}

// Close the connection
$conn = null;
?>
