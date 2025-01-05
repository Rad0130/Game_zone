<?php
include 'connect.php';

// Get the POST data
$data = json_decode(file_get_contents('php://input'), true);

// Check if all required fields are present in the POST data
if (!isset($data['userId'], $data['gameId'], $data['gameName'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Missing required fields: userId, gameId, or gameName'
    ]);
    exit;
}

// Sanitize and validate the input
$userId = intval($data['userId']); // Ensure userId is an integer
$gameId = intval($data['gameId']); // Ensure gameId is an integer
$gameName = htmlspecialchars($data['gameName'], ENT_QUOTES, 'UTF-8'); // Escape game name to prevent XSS
$borrowDate = date('Y-m-d');
$returnDate = date('Y-m-d', strtotime('+1 month'));

// Insert the borrowed game into the database
$sql = "INSERT INTO borrowed_games (user_id, game_id, game_name, borrow_date, return_date) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'error' => 'Failed to prepare SQL statement: ' . $conn->error
    ]);
    exit;
}

$stmt->bind_param("iisss", $userId, $gameId, $gameName, $borrowDate, $returnDate);

$response = [];
if ($stmt->execute()) {
    $response['success'] = true;
} else {
    $response['success'] = false;
    $response['error'] = $stmt->error;
}

$stmt->close();
$conn->close();

echo json_encode($response);
?>
