const fs = require('fs');
const path = require('path');

const targetDir = 'D:/xampp/htdocs/flutter/cloth_bank_app/lib';

function writeDartFile(relPath, content) {
  const fullPath = path.join(targetDir, relPath);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, content.trim(), 'utf8');
  console.log(`Written: ${relPath}`);
}

// 1. AppColors
writeDartFile('core/constants/app_colors.dart', `
import 'package:flutter/material.dart';

class AppColors {
  static const Color primary = Color(0xFF10B981);
  static const Color primaryDark = Color(0xFF059669);
  static const Color primaryLight = Color(0xFFD1FAE5);

  static const Color indigo = Color(0xFF4F46E5);
  static const Color indigoLight = Color(0xFFEEF2FF);

  static const Color sky = Color(0xFF0EA5E9);
  static const Color skyLight = Color(0xFFF0F9FF);

  static const Color amber = Color(0xFFF59E0B);
  static const Color amberLight = Color(0xFFFEF3C7);

  static const Color rose = Color(0xFFEF4444);
  static const Color roseLight = Color(0xFFFEE2E2);

  static const Color background = Color(0xFFF8FAFC);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color cardBorder = Color(0xFFE2E8F0);

  static const Color textMain = Color(0xFF0F172A);
  static const Color textSecondary = Color(0xFF334155);
  static const Color textMuted = Color(0xFF64748B);
  static const Color textLight = Color(0xFF94A3B8);

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF10B981), Color(0xFF059669)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient headerGradient = LinearGradient(
    colors: [Color(0xFF0F172A), Color(0xFF1E293B)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient adminGradient = LinearGradient(
    colors: [Color(0xFF4F46E5), Color(0xFF3730A3)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient agentGradient = LinearGradient(
    colors: [Color(0xFF0EA5E9), Color(0xFF0284C7)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
`);

// 2. StorageService
writeDartFile('core/services/storage_service.dart', `
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/user_model.dart';

class StorageService {
  static const String keyBaseUrl = 'server_base_url';
  static const String keyToken = 'auth_token';
  static const String keyUser = 'auth_user';

  static Future<String?> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(keyBaseUrl);
  }

  static Future<void> setBaseUrl(String url) async {
    final prefs = await SharedPreferences.getInstance();
    var normalized = url.trim();
    if (normalized.endsWith('/')) {
      normalized = normalized.substring(0, normalized.length - 1);
    }
    await prefs.setString(keyBaseUrl, normalized);
  }

  static Future<void> clearBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(keyBaseUrl);
  }

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString(keyToken);
  }

  static Future<void> setToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(keyToken, token);
  }

  static Future<UserModel?> getUser() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(keyUser);
    if (jsonStr == null) return null;
    try {
      return UserModel.fromJson(jsonDecode(jsonStr));
    } catch (_) {
      return null;
    }
  }

  static Future<void> setUser(UserModel user) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(keyUser, jsonEncode(user.toJson()));
  }

  static Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(keyToken);
    await prefs.remove(keyUser);
  }
}
`);

// 3. UserModel
writeDartFile('core/models/user_model.dart', `
class UserModel {
  final int id;
  final String name;
  final String email;
  final String? phone;
  final String role;
  final List<String> permissions;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.phone,
    required this.role,
    this.permissions = const [],
  });

  bool get isAdmin => role == 'admin';
  bool get isAgent => role == 'agent';
  bool get isUser => role == 'user';

  bool hasPermission(String permission) {
    if (isAdmin) return true;
    return permissions.contains(permission) || permissions.contains('manage_all');
  }

  factory UserModel.fromJson(Map<String, dynamic> json) {
    var rawPerms = json['permissions'];
    List<String> perms = [];
    if (rawPerms is List) {
      perms = rawPerms.map((e) => e.toString()).toList();
    }

    return UserModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString(),
      role: json['role']?.toString() ?? 'user',
      permissions: perms,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role,
      'permissions': permissions,
    };
  }
}
`);

// 4. CampaignModel
writeDartFile('core/models/campaign_model.dart', `
class CampaignModel {
  final int id;
  final String title;
  final String? description;
  final String? startDate;
  final String? endDate;
  final String status;
  final int donationsCount;
  final int totalQuantity;

  CampaignModel({
    required this.id,
    required this.title,
    this.description,
    this.startDate,
    this.endDate,
    this.status = 'active',
    this.donationsCount = 0,
    this.totalQuantity = 0,
  });

  bool get isActive => status == 'active';

  factory CampaignModel.fromJson(Map<String, dynamic> json) {
    return CampaignModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString(),
      startDate: json['start_date']?.toString(),
      endDate: json['end_date']?.toString(),
      status: json['status']?.toString() ?? 'active',
      donationsCount: json['donations_count'] is int
          ? json['donations_count']
          : int.tryParse(json['donations_count']?.toString() ?? '0') ?? 0,
      totalQuantity: json['total_quantity'] is int
          ? json['total_quantity']
          : int.tryParse(json['total_quantity']?.toString() ?? '0') ?? 0,
    );
  }
}
`);

// 5. ClothTypeModel
writeDartFile('core/models/cloth_type_model.dart', `
class ClothTypeModel {
  final int id;
  final String name;
  final bool isActive;

  ClothTypeModel({
    required this.id,
    required this.name,
    this.isActive = true,
  });

  factory ClothTypeModel.fromJson(Map<String, dynamic> json) {
    return ClothTypeModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      name: json['name']?.toString() ?? '',
      isActive: json['is_active'] == true || json['is_active'] == 1 || json['is_active'] == '1',
    );
  }
}
`);

// 6. DonationModel
writeDartFile('core/models/donation_model.dart', `
class DonationItemImageModel {
  final int id;
  final String url;

  DonationItemImageModel({
    required this.id,
    required this.url,
  });

  factory DonationItemImageModel.fromJson(Map<String, dynamic> json) {
    return DonationItemImageModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      url: json['url']?.toString() ?? '',
    );
  }
}

class DonationItemModel {
  final int id;
  final int clothTypeId;
  final String clothTypeName;
  final int quantity;
  final String? note;
  final List<DonationItemImageModel> images;

  DonationItemModel({
    required this.id,
    required this.clothTypeId,
    required this.clothTypeName,
    required this.quantity,
    this.note,
    this.images = const [],
  });

  factory DonationItemModel.fromJson(Map<String, dynamic> json) {
    String typeName = 'Clothes';
    if (json['cloth_type'] is Map && json['cloth_type']['name'] != null) {
      typeName = json['cloth_type']['name'].toString();
    }

    List<DonationItemImageModel> imgs = [];
    if (json['images'] is List) {
      imgs = (json['images'] as List)
          .map((i) => DonationItemImageModel.fromJson(i))
          .toList();
    }

    return DonationItemModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      clothTypeId: json['cloth_type_id'] is int
          ? json['cloth_type_id']
          : int.tryParse(json['cloth_type_id']?.toString() ?? '0') ?? 0,
      clothTypeName: typeName,
      quantity: json['quantity'] is int
          ? json['quantity']
          : int.tryParse(json['quantity']?.toString() ?? '0') ?? 0,
      note: json['note']?.toString(),
      images: imgs,
    );
  }
}

class DonationModel {
  final int id;
  final int? userId;
  final int campaignId;
  final String campaignTitle;
  final String donorName;
  final String donorPhone;
  final String donorEmail;
  final String collectionType;
  final double? latitude;
  final double? longitude;
  final String? address;
  final String status;
  final int? verifiedQuantity;
  final int? agentId;
  final String? agentName;
  final String? agentPhone;
  final String? pickedUpAt;
  final String? deliveredAt;
  final String? verifiedAt;
  final String? createdAt;
  final List<DonationItemModel> items;

  DonationModel({
    required this.id,
    this.userId,
    required this.campaignId,
    required this.campaignTitle,
    required this.donorName,
    required this.donorPhone,
    required this.donorEmail,
    required this.collectionType,
    this.latitude,
    this.longitude,
    this.address,
    required this.status,
    this.verifiedQuantity,
    this.agentId,
    this.agentName,
    this.agentPhone,
    this.pickedUpAt,
    this.deliveredAt,
    this.verifiedAt,
    this.createdAt,
    this.items = const [],
  });

  int get totalPieces {
    if (items.isEmpty) return verifiedQuantity ?? 0;
    return items.fold(0, (sum, item) => sum + item.quantity);
  }

  factory DonationModel.fromJson(Map<String, dynamic> json) {
    String campTitle = 'General Campaign';
    if (json['campaign'] is Map && json['campaign']['title'] != null) {
      campTitle = json['campaign']['title'].toString();
    }

    String? aName;
    String? aPhone;
    if (json['agent'] is Map) {
      aName = json['agent']['name']?.toString();
      aPhone = json['agent']['phone']?.toString();
    }

    List<DonationItemModel> itms = [];
    if (json['items'] is List) {
      itms = (json['items'] as List)
          .map((i) => DonationItemModel.fromJson(i))
          .toList();
    }

    return DonationModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      userId: json['user_id'] != null ? int.tryParse(json['user_id'].toString()) : null,
      campaignId: json['campaign_id'] is int
          ? json['campaign_id']
          : int.tryParse(json['campaign_id']?.toString() ?? '0') ?? 0,
      campaignTitle: campTitle,
      donorName: json['donor_name']?.toString() ?? '',
      donorPhone: json['donor_phone']?.toString() ?? '',
      donorEmail: json['donor_email']?.toString() ?? '',
      collectionType: json['collection_type']?.toString() ?? 'pickup',
      latitude: json['latitude'] != null ? double.tryParse(json['latitude'].toString()) : null,
      longitude: json['longitude'] != null ? double.tryParse(json['longitude'].toString()) : null,
      address: json['address']?.toString(),
      status: json['status']?.toString() ?? 'pending',
      verifiedQuantity: json['verified_quantity'] != null
          ? int.tryParse(json['verified_quantity'].toString())
          : null,
      agentId: json['agent_id'] != null ? int.tryParse(json['agent_id'].toString()) : null,
      agentName: aName,
      agentPhone: aPhone,
      pickedUpAt: json['picked_up_at']?.toString(),
      deliveredAt: json['delivered_at']?.toString(),
      verifiedAt: json['verified_at']?.toString(),
      createdAt: json['created_at']?.toString(),
      items: itms,
    );
  }
}
`);

// 7. ApiService
writeDartFile('core/services/api_service.dart', `
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import 'storage_service.dart';
import '../models/user_model.dart';
import '../models/campaign_model.dart';
import '../models/cloth_type_model.dart';
import '../models/donation_model.dart';

class ApiService {
  static Future<String> _getBaseUrl() async {
    final url = await StorageService.getBaseUrl();
    if (url == null || url.trim().isEmpty) {
      throw Exception('Server URL is not configured. Please scan the Server QR Code first.');
    }
    return url;
  }

  static Future<Map<String, String>> _getHeaders({bool isMultipart = false}) async {
    final token = await StorageService.getToken();
    final headers = <String, String>{
      'Accept': 'application/json',
    };
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  static Future<Map<String, dynamic>> testConnection(String rawUrl) async {
    var cleanUrl = rawUrl.trim();
    if (cleanUrl.endsWith('/')) {
      cleanUrl = cleanUrl.substring(0, cleanUrl.length - 1);
    }
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = 'http://$cleanUrl';
    }
    if (!cleanUrl.endsWith('/api')) {
      cleanUrl = '$cleanUrl/api';
    }

    final uri = Uri.parse('$cleanUrl/ping');
    final response = await http.get(uri).timeout(const Duration(seconds: 8));

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final json = jsonDecode(response.body);
      return {
        'success': true,
        'baseUrl': cleanUrl,
        'data': json,
      };
    } else {
      throw Exception('Server returned status \${response.statusCode}');
    }
  }

  static Future<UserModel> login(String email, String password) async {
    final baseUrl = await _getBaseUrl();
    final response = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: await _getHeaders(),
      body: jsonEncode({'email': email, 'password': password}),
    );

    final json = jsonDecode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      final token = json['token']?.toString() ?? '';
      final user = UserModel.fromJson(json['user']);
      await StorageService.setToken(token);
      await StorageService.setUser(user);
      return user;
    } else {
      throw Exception(json['message'] ?? 'Login failed. Please check credentials.');
    }
  }

  static Future<List<CampaignModel>> getActiveCampaigns() async {
    final baseUrl = await _getBaseUrl();
    final response = await http.get(
      Uri.parse('$baseUrl/campaigns/active'),
      headers: await _getHeaders(),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final list = jsonDecode(response.body) as List;
      return list.map((e) => CampaignModel.fromJson(e)).toList();
    }
    throw Exception('Failed to load active campaigns');
  }

  static Future<List<ClothTypeModel>> getClothTypes() async {
    final baseUrl = await _getBaseUrl();
    final response = await http.get(
      Uri.parse('$baseUrl/cloth-types'),
      headers: await _getHeaders(),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final list = jsonDecode(response.body) as List;
      return list.map((e) => ClothTypeModel.fromJson(e)).toList();
    }
    throw Exception('Failed to load cloth categories');
  }

  static Future<Map<String, dynamic>> submitDonation({
    required int campaignId,
    required String donorName,
    required String donorPhone,
    required String donorEmail,
    required String collectionType,
    String? address,
    double? latitude,
    double? longitude,
    required List<Map<String, dynamic>> items,
    required List<List<XFile>> itemImages,
  }) async {
    final baseUrl = await _getBaseUrl();
    final uri = Uri.parse('$baseUrl/donations');
    final request = http.MultipartRequest('POST', uri);

    request.headers.addAll(await _getHeaders(isMultipart: true));

    request.fields['campaign_id'] = campaignId.toString();
    request.fields['donor_name'] = donorName;
    request.fields['donor_phone'] = donorPhone;
    request.fields['donor_email'] = donorEmail;
    request.fields['collection_type'] = collectionType;
    if (address != null && address.isNotEmpty) request.fields['address'] = address;
    if (latitude != null) request.fields['latitude'] = latitude.toString();
    if (longitude != null) request.fields['longitude'] = longitude.toString();

    for (int i = 0; i < items.length; i++) {
      request.fields['items[$i][cloth_type_id]'] = items[i]['cloth_type_id'].toString();
      request.fields['items[$i][quantity]'] = items[i]['quantity'].toString();
      if (items[i]['note'] != null && items[i]['note'].toString().isNotEmpty) {
        request.fields['items[$i][note]'] = items[i]['note'].toString();
      }

      if (i < itemImages.length) {
        final imgs = itemImages[i];
        for (final img in imgs) {
          final file = await http.MultipartFile.fromPath('items[$i][images][]', img.path);
          request.files.add(file);
        }
      }
    }

    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    final json = jsonDecode(response.body);

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json;
    } else {
      throw Exception(json['message'] ?? 'Donation submission failed');
    }
  }

  static Future<DonationModel> getDonationById(int id) async {
    final baseUrl = await _getBaseUrl();
    final response = await http.get(
      Uri.parse('$baseUrl/donations/$id'),
      headers: await _getHeaders(),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return DonationModel.fromJson(jsonDecode(response.body));
    }
    throw Exception('Donation not found');
  }

  static Future<List<DonationModel>> getAgentPickups() async {
    final baseUrl = await _getBaseUrl();
    final response = await http.get(
      Uri.parse('$baseUrl/agent/pickups'),
      headers: await _getHeaders(),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final list = jsonDecode(response.body) as List;
      return list.map((e) => DonationModel.fromJson(e)).toList();
    }
    throw Exception('Failed to load agent pickups');
  }

  static Future<DonationModel> markPickedUp(int donationId) async {
    final baseUrl = await _getBaseUrl();
    final response = await http.patch(
      Uri.parse('$baseUrl/donations/$donationId/pickup'),
      headers: await _getHeaders(),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return DonationModel.fromJson(jsonDecode(response.body));
    }
    throw Exception('Failed to update pickup status');
  }

  static Future<DonationModel> markDelivered(int donationId) async {
    final baseUrl = await _getBaseUrl();
    final response = await http.patch(
      Uri.parse('$baseUrl/donations/$donationId/deliver'),
      headers: await _getHeaders(),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return DonationModel.fromJson(jsonDecode(response.body));
    }
    throw Exception('Failed to update delivery status');
  }

  static Future<Map<String, dynamic>> getAdminDashboard() async {
    final baseUrl = await _getBaseUrl();
    final response = await http.get(
      Uri.parse('$baseUrl/dashboard'),
      headers: await _getHeaders(),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load admin dashboard');
  }

  static Future<List<DonationModel>> getAdminDonations() async {
    final baseUrl = await _getBaseUrl();
    final response = await http.get(
      Uri.parse('$baseUrl/donations'),
      headers: await _getHeaders(),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final list = jsonDecode(response.body) as List;
      return list.map((e) => DonationModel.fromJson(e)).toList();
    }
    throw Exception('Failed to load donations');
  }

  static Future<List<UserModel>> getAgents() async {
    final baseUrl = await _getBaseUrl();
    final response = await http.get(
      Uri.parse('$baseUrl/users/agents'),
      headers: await _getHeaders(),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      final list = jsonDecode(response.body) as List;
      return list.map((e) => UserModel.fromJson(e)).toList();
    }
    return [];
  }

  static Future<void> assignDriver(int donationId, int agentId) async {
    final baseUrl = await _getBaseUrl();
    final response = await http.patch(
      Uri.parse('$baseUrl/donations/$donationId/assign'),
      headers: await _getHeaders(),
      body: jsonEncode({'agent_id': agentId}),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Failed to assign driver');
    }
  }

  static Future<void> verifyIntake(int donationId, int verifiedQuantity) async {
    final baseUrl = await _getBaseUrl();
    final response = await http.patch(
      Uri.parse('$baseUrl/donations/$donationId/verify'),
      headers: await _getHeaders(),
      body: jsonEncode({'verified_quantity': verifiedQuantity}),
    );

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw Exception('Failed to verify intake');
    }
  }
}
`);

// 8. QrScannerScreen
writeDartFile('screens/qr_scanner_screen.dart', `
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../core/constants/app_colors.dart';
import '../core/services/api_service.dart';
import '../core/services/storage_service.dart';
import 'donor/donor_home_screen.dart';

class QrScannerScreen extends StatefulWidget {
  final bool isReconnecting;
  const QrScannerScreen({super.key, this.isReconnecting = false});

  @override
  State<QrScannerScreen> createState() => _QrScannerScreenState();
}

class _QrScannerScreenState extends State<QrScannerScreen> {
  final MobileScannerController _scannerController = MobileScannerController(
    detectionSpeed: DetectionSpeed.normal,
    facing: CameraFacing.back,
  );

  bool _isProcessing = false;
  String? _errorMessage;
  String? _statusMessage;
  final TextEditingController _manualUrlController = TextEditingController();

  @override
  void dispose() {
    _scannerController.dispose();
    _manualUrlController.dispose();
    super.dispose();
  }

  Future<void> _handleScannedData(String rawData) async {
    if (_isProcessing) return;
    setState(() {
      _isProcessing = true;
      _errorMessage = null;
      _statusMessage = 'Connecting to server...';
    });

    try {
      String candidateUrl = rawData.trim();

      if (candidateUrl.startsWith('{') && candidateUrl.contains('server_url')) {
        final match = RegExp(r'"server_url"\\s*:\\s*"([^"]+)"').firstMatch(candidateUrl);
        if (match != null) {
          candidateUrl = match.group(1)!;
        }
      }

      final testResult = await ApiService.testConnection(candidateUrl);
      final finalBaseUrl = testResult['baseUrl'] as String;

      await StorageService.setBaseUrl(finalBaseUrl);

      if (!mounted) return;
      setState(() {
        _statusMessage = 'Connected to Cloth Bank Server!';
      });

      await Future.delayed(const Duration(milliseconds: 600));

      if (!mounted) return;
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (_) => const DonorHomeScreen()),
        (route) => false,
      );
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = 'Invalid QR Code or unreachable server: \$e';
        _isProcessing = false;
      });
    }
  }

  void _showManualEntryDialog() {
    _manualUrlController.text = '';
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) {
        return Padding(
          padding: EdgeInsets.only(
            left: 24,
            right: 24,
            top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Manual Server URL',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textMain,
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(ctx),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                'Enter the IP address or host of your organization\\'s Cloth Bank server:',
                style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _manualUrlController,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: 'e.g. http://192.168.1.50:8000/api',
                  filled: true,
                  fillColor: AppColors.background,
                  prefixIcon: const Icon(Icons.link, color: AppColors.primary),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.cardBorder),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.primary, width: 2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: () {
                    final text = _manualUrlController.text.trim();
                    if (text.isNotEmpty) {
                      Navigator.pop(ctx);
                      _handleScannedData(text);
                    }
                  },
                  child: Text(
                    'Connect to Server',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: Stack(
        children: [
          MobileScanner(
            controller: _scannerController,
            onDetect: (capture) {
              final barcodes = capture.barcodes;
              for (final barcode in barcodes) {
                if (barcode.rawValue != null && !_isProcessing) {
                  _handleScannedData(barcode.rawValue!);
                  break;
                }
              }
            },
          ),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  child: Row(
                    children: [
                      if (widget.isReconnecting)
                        IconButton(
                          icon: const Icon(Icons.arrow_back, color: Colors.white),
                          onPressed: () => Navigator.pop(context),
                        ),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '🧺 Cloth Bank Connect',
                              style: GoogleFonts.plusJakartaSans(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            Text(
                              'Scan Server Poster QR Code',
                              style: GoogleFonts.inter(
                                color: const Color(0xFF94A3B8),
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.flash_on, color: Colors.white),
                        onPressed: () => _scannerController.toggleTorch(),
                      ),
                    ],
                  ),
                ),
                const Spacer(),
                Container(
                  width: 260,
                  height: 260,
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.primary, width: 3),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: const [
                      BoxShadow(
                        color: Color(0x4D10B981),
                        blurRadius: 20,
                        spreadRadius: 2,
                      ),
                    ],
                  ),
                  child: Center(
                    child: _isProcessing
                        ? Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const CircularProgressIndicator(color: AppColors.primary),
                              const SizedBox(height: 12),
                              Text(
                                _statusMessage ?? 'Connecting...',
                                style: GoogleFonts.inter(
                                  color: Colors.white,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ],
                          )
                        : Container(
                            width: 240,
                            height: 2,
                            decoration: const BoxDecoration(
                              color: AppColors.primary,
                              boxShadow: [
                                BoxShadow(
                                  color: Color(0xCC10B981),
                                  blurRadius: 8,
                                ),
                              ],
                            ),
                          ),
                  ),
                ),
                const Spacer(),
                if (_errorMessage != null)
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xE6EF4444),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: Colors.white, size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            _errorMessage!,
                            style: GoogleFonts.inter(color: Colors.white, fontSize: 12),
                          ),
                        ),
                      ],
                    ),
                  ),
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Point camera at the Cloth Bank Poster QR code to connect to your local organization\\'s server.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.inter(
                          fontSize: 13,
                          color: AppColors.textMuted,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: OutlinedButton.icon(
                          style: OutlinedButton.styleFrom(
                            side: const BorderSide(color: AppColors.cardBorder),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          onPressed: _showManualEntryDialog,
                          icon: const Icon(Icons.edit_note, color: AppColors.indigo),
                          label: Text(
                            'Enter Server IP / URL Manually',
                            style: GoogleFonts.plusJakartaSans(
                              fontWeight: FontWeight.w700,
                              color: AppColors.indigo,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
`);

// 9. LoginScreen
writeDartFile('screens/auth/login_screen.dart', `
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/services/api_service.dart';
import '../../core/services/storage_service.dart';
import '../admin/admin_dashboard_screen.dart';
import '../agent/agent_pickups_screen.dart';
import '../qr_scanner_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isLoading = false;
  bool _obscurePassword = true;
  String? _errorMessage;
  String? _serverUrl;

  @override
  void initState() {
    super.initState();
    _loadServerUrl();
  }

  Future<void> _loadServerUrl() async {
    final url = await StorageService.getBaseUrl();
    if (mounted) {
      setState(() {
        _serverUrl = url;
      });
    }
  }

  Future<void> _handleLogin() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      setState(() {
        _errorMessage = 'Please enter both email and password.';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final user = await ApiService.login(email, password);

      if (!mounted) return;

      if (user.isAdmin) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const AdminDashboardScreen()),
          (route) => false,
        );
      } else if (user.isAgent) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const AgentPickupsScreen()),
          (route) => false,
        );
      } else {
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _errorMessage = e.toString().replaceAll('Exception: ', '');
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.textMain, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          TextButton.icon(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const QrScannerScreen(isReconnecting: true)),
              ).then((_) => _loadServerUrl());
            },
            icon: const Icon(Icons.qr_code_scanner, size: 18, color: AppColors.indigo),
            label: Text(
              'Change Server',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.indigo,
              ),
            ),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: AppColors.indigoLight,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Center(
                  child: Icon(Icons.badge, color: AppColors.indigo, size: 28),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'Staff & Admin Portal',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 26,
                  fontWeight: FontWeight.w800,
                  color: AppColors.textMain,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Log in as Super Admin or Logistics Driver to manage campaigns and pickups.',
                style: GoogleFonts.inter(fontSize: 14, color: AppColors.textMuted),
              ),
              if (_serverUrl != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.primaryLight,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0x4D10B981)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.cloud_done, size: 14, color: AppColors.primaryDark),
                      const SizedBox(width: 6),
                      Text(
                        'Connected: \$_serverUrl',
                        style: GoogleFonts.inter(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: AppColors.primaryDark,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 28),
              if (_errorMessage != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.roseLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0x4DEF4444)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.error_outline, color: AppColors.rose, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _errorMessage!,
                          style: GoogleFonts.inter(color: AppColors.rose, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],
              Text(
                'Email Address',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textMain,
                ),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(
                  hintText: 'admin@clothbank.com / agent@clothbank.com',
                  filled: true,
                  fillColor: Colors.white,
                  prefixIcon: const Icon(Icons.email_outlined, color: AppColors.textMuted),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.cardBorder),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.cardBorder),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.indigo, width: 2),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Text(
                'Password',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textMain,
                ),
              ),
              const SizedBox(height: 6),
              TextField(
                controller: _passwordController,
                obscureText: _obscurePassword,
                decoration: InputDecoration(
                  hintText: 'Enter your password',
                  filled: true,
                  fillColor: Colors.white,
                  prefixIcon: const Icon(Icons.lock_outline, color: AppColors.textMuted),
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                      color: AppColors.textMuted,
                    ),
                    onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.cardBorder),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.cardBorder),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.indigo, width: 2),
                  ),
                ),
              ),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.indigo,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                    elevation: 2,
                  ),
                  onPressed: _isLoading ? null : _handleLogin,
                  child: _isLoading
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                        )
                      : Text(
                          'Sign In to Dashboard',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 24),
              Center(
                child: TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    '← Back to Donor Clothes Portal',
                    style: GoogleFonts.inter(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textMuted,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
`);

// 10. DonorHomeScreen
writeDartFile('screens/donor/donor_home_screen.dart', `
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/campaign_model.dart';
import '../../core/models/cloth_type_model.dart';
import '../../core/services/api_service.dart';
import '../auth/login_screen.dart';
import '../qr_scanner_screen.dart';
import 'track_donation_screen.dart';

class DonorHomeScreen extends StatefulWidget {
  const DonorHomeScreen({super.key});

  @override
  State<DonorHomeScreen> createState() => _DonorHomeScreenState();
}

class _DonorHomeScreenState extends State<DonorHomeScreen> {
  bool _isLoading = true;
  List<CampaignModel> _campaigns = [];
  List<ClothTypeModel> _clothTypes = [];

  int? _selectedCampaignId;
  String _collectionType = 'pickup';
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();

  final List<Map<String, dynamic>> _donationItems = [];
  final List<List<XFile>> _itemImages = [];

  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);

    try {
      final campaigns = await ApiService.getActiveCampaigns();
      final types = await ApiService.getClothTypes();

      if (!mounted) return;
      setState(() {
        _campaigns = campaigns;
        _clothTypes = types;
        if (campaigns.isNotEmpty) {
          _selectedCampaignId = campaigns.first.id;
        }

        if (_donationItems.isEmpty && types.isNotEmpty) {
          _donationItems.add({
            'cloth_type_id': types.first.id,
            'quantity': 3,
            'note': '',
          });
          _itemImages.add([]);
        }
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load server data: \$e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _addItemRow() {
    if (_clothTypes.isEmpty) return;
    setState(() {
      _donationItems.add({
        'cloth_type_id': _clothTypes.first.id,
        'quantity': 2,
        'note': '',
      });
      _itemImages.add([]);
    });
  }

  void _removeItemRow(int index) {
    if (_donationItems.length <= 1) return;
    setState(() {
      _donationItems.removeAt(index);
      _itemImages.removeAt(index);
    });
  }

  Future<void> _pickImageForItem(int index) async {
    final picker = ImagePicker();
    final picked = await picker.pickImage(source: ImageSource.camera, imageQuality: 75);
    if (picked != null) {
      setState(() {
        _itemImages[index].add(picked);
      });
    }
  }

  Future<void> _submitDonation() async {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim();
    final email = _emailController.text.trim();
    final address = _addressController.text.trim();

    if (_selectedCampaignId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select an active campaign.')),
      );
      return;
    }

    if (name.isEmpty || phone.isEmpty || email.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter donor name, phone, and email.')),
      );
      return;
    }

    if (_collectionType == 'pickup' && address.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter your pickup address.')),
      );
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final res = await ApiService.submitDonation(
        campaignId: _selectedCampaignId!,
        donorName: name,
        donorPhone: phone,
        donorEmail: email,
        collectionType: _collectionType,
        address: address.isNotEmpty ? address : null,
        items: _donationItems,
        itemImages: _itemImages,
      );

      final donation = res['donation'];
      final donId = donation != null ? donation['id']?.toString() : 'Submitted';

      if (!mounted) return;

      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              const Icon(Icons.check_circle, color: AppColors.primary, size: 28),
              const SizedBox(width: 8),
              Text('Thank You!', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800)),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Your clothes donation has been registered successfully.',
                style: GoogleFonts.inter(fontSize: 14),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.primaryLight,
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Row(
                  children: [
                    Text('Tracking ID: ', style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                    Text(
                      '#CB-\$donId',
                      style: GoogleFonts.plusJakartaSans(
                        fontWeight: FontWeight.w800,
                        color: AppColors.primaryDark,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'A confirmation email has been sent to \$email. When our driver verifies the clothes at the hub, you will receive your digital Certificate of Kindness.',
                style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                _nameController.clear();
                _phoneController.clear();
                _emailController.clear();
                _addressController.clear();
                setState(() {
                  _donationItems.clear();
                  _itemImages.clear();
                  _loadData();
                });
              },
              child: const Text('Donate More'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () {
                Navigator.pop(ctx);
                if (int.tryParse(donId ?? '') != null) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => TrackDonationScreen(donationId: int.parse(donId!)),
                    ),
                  );
                }
              },
              child: const Text('Track Status', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Submission failed: \$e'), backgroundColor: AppColors.rose),
      );
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primaryLight,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Text('🧺', style: TextStyle(fontSize: 18)),
            ),
            const SizedBox(width: 8),
            Text(
              'Cloth Bank',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: AppColors.textMain,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.search, color: AppColors.textMain),
            tooltip: 'Track by ID',
            onPressed: () => _showTrackDialog(),
          ),
          IconButton(
            icon: const Icon(Icons.qr_code_scanner, color: AppColors.indigo),
            tooltip: 'Change Server QR',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const QrScannerScreen(isReconnecting: true)),
            ).then((_) => _loadData()),
          ),
          IconButton(
            icon: const Icon(Icons.admin_panel_settings_outlined, color: AppColors.textMain),
            tooltip: 'Staff Login',
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const LoginScreen()),
            ),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : RefreshIndicator(
              onRefresh: _loadData,
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        gradient: AppColors.headerGradient,
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x14000000),
                            blurRadius: 15,
                            offset: Offset(0, 5),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: const Color(0x3310B981),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: const Color(0x6610B981)),
                            ),
                            child: Text(
                              '● COMMUNITY DRIVE ACTIVE',
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                          const SizedBox(height: 10),
                          Text(
                            'Donate Clothes,\\nSpread Warmth.',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 22,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              height: 1.2,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'Schedule a doorstep pickup or drop off at our hub in 2 easy steps.',
                            style: GoogleFonts.inter(
                              fontSize: 13,
                              color: const Color(0xFF94A3B8),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 20),

                    Text(
                      '1. Select Active Drive',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textMain,
                      ),
                    ),
                    const SizedBox(height: 10),
                    if (_campaigns.isEmpty)
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: const Text('No active campaigns running currently.'),
                      )
                    else
                      SizedBox(
                        height: 90,
                        child: ListView.builder(
                          scrollDirection: Axis.horizontal,
                          itemCount: _campaigns.length,
                          itemBuilder: (ctx, i) {
                            final c = _campaigns[i];
                            final isSelected = _selectedCampaignId == c.id;
                            return GestureDetector(
                              onTap: () => setState(() => _selectedCampaignId = c.id),
                              child: Container(
                                width: 220,
                                margin: const EdgeInsets.only(right: 12),
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: isSelected ? AppColors.primaryLight : Colors.white,
                                  borderRadius: BorderRadius.circular(14),
                                  border: Border.all(
                                    color: isSelected ? AppColors.primary : AppColors.cardBorder,
                                    width: isSelected ? 2 : 1,
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      c.title,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w700,
                                        color: isSelected ? AppColors.primaryDark : AppColors.textMain,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '📦 \${c.donationsCount} donations collected',
                                      style: GoogleFonts.inter(
                                        fontSize: 11,
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),

                    const SizedBox(height: 24),

                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '2. Clothes Breakdown',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 16,
                            fontWeight: FontWeight.w800,
                            color: AppColors.textMain,
                          ),
                        ),
                        TextButton.icon(
                          onPressed: _addItemRow,
                          icon: const Icon(Icons.add_circle, color: AppColors.primary, size: 18),
                          label: Text(
                            '+ Add Category',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ],
                    ),

                    ListView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      itemCount: _donationItems.length,
                      itemBuilder: (ctx, idx) {
                        final item = _donationItems[idx];
                        final imgs = _itemImages[idx];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 12),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.cardBorder),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(
                                    child: DropdownButtonFormField<int>(
                                      value: item['cloth_type_id'],
                                      decoration: InputDecoration(
                                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                      ),
                                      items: _clothTypes.map((t) {
                                        return DropdownMenuItem<int>(
                                          value: t.id,
                                          child: Text(t.name, style: GoogleFonts.inter(fontSize: 13)),
                                        );
                                      }).toList(),
                                      onChanged: (val) {
                                        if (val != null) setState(() => item['cloth_type_id'] = val);
                                      },
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Container(
                                    decoration: BoxDecoration(
                                      color: AppColors.background,
                                      borderRadius: BorderRadius.circular(10),
                                      border: Border.all(color: AppColors.cardBorder),
                                    ),
                                    child: Row(
                                      children: [
                                        IconButton(
                                          icon: const Icon(Icons.remove, size: 16),
                                          onPressed: () {
                                            if (item['quantity'] > 1) {
                                              setState(() => item['quantity']--);
                                            }
                                          },
                                        ),
                                        Text(
                                          '\${item['quantity']} pcs',
                                          style: GoogleFonts.plusJakartaSans(
                                            fontWeight: FontWeight.w700,
                                            fontSize: 13,
                                          ),
                                        ),
                                        IconButton(
                                          icon: const Icon(Icons.add, size: 16),
                                          onPressed: () {
                                            setState(() => item['quantity']++);
                                          },
                                        ),
                                      ],
                                    ),
                                  ),
                                  if (_donationItems.length > 1)
                                    IconButton(
                                      icon: const Icon(Icons.delete_outline, color: AppColors.rose, size: 20),
                                      onPressed: () => _removeItemRow(idx),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              TextField(
                                onChanged: (val) => item['note'] = val,
                                decoration: InputDecoration(
                                  hintText: 'Note (e.g. Size L, gently used warm sweaters)',
                                  hintStyle: GoogleFonts.inter(fontSize: 12, color: AppColors.textLight),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                                ),
                              ),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  OutlinedButton.icon(
                                    onPressed: () => _pickImageForItem(idx),
                                    icon: const Icon(Icons.camera_alt, size: 16, color: AppColors.indigo),
                                    label: Text(
                                      'Take Photo',
                                      style: GoogleFonts.inter(fontSize: 12, color: AppColors.indigo),
                                    ),
                                    style: OutlinedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: imgs.isEmpty
                                        ? Text(
                                            'Optional item photo',
                                            style: GoogleFonts.inter(fontSize: 11, color: AppColors.textLight),
                                          )
                                        : Text(
                                            '📷 \${imgs.length} photo(s) attached',
                                            style: GoogleFonts.inter(
                                              fontSize: 12,
                                              fontWeight: FontWeight.w600,
                                              color: AppColors.primaryDark,
                                            ),
                                          ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),

                    const SizedBox(height: 20),

                    Text(
                      '3. Collection Mode',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textMain,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _collectionType = 'pickup'),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: _collectionType == 'pickup' ? AppColors.primaryLight : Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: _collectionType == 'pickup' ? AppColors.primary : AppColors.cardBorder,
                                  width: _collectionType == 'pickup' ? 2 : 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  const Text('🚚', style: TextStyle(fontSize: 20)),
                                  const SizedBox(width: 8),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Doorstep Pickup',
                                        style: GoogleFonts.plusJakartaSans(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                          color: _collectionType == 'pickup' ? AppColors.primaryDark : AppColors.textMain,
                                        ),
                                      ),
                                      Text('Driver visits you', style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: GestureDetector(
                            onTap: () => setState(() => _collectionType = 'drop'),
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: _collectionType == 'drop' ? AppColors.primaryLight : Colors.white,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: _collectionType == 'drop' ? AppColors.primary : AppColors.cardBorder,
                                  width: _collectionType == 'drop' ? 2 : 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  const Text('🏢', style: TextStyle(fontSize: 20)),
                                  const SizedBox(width: 8),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Self Drop-off',
                                        style: GoogleFonts.plusJakartaSans(
                                          fontSize: 13,
                                          fontWeight: FontWeight.w700,
                                          color: _collectionType == 'drop' ? AppColors.primaryDark : AppColors.textMain,
                                        ),
                                      ),
                                      Text('Drop at Hub Center', style: GoogleFonts.inter(fontSize: 11, color: AppColors.textMuted)),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 20),

                    Text(
                      '4. Donor Information',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textMain,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.cardBorder),
                      ),
                      child: Column(
                        children: [
                          TextField(
                            controller: _nameController,
                            decoration: InputDecoration(
                              labelText: 'Full Name *',
                              prefixIcon: const Icon(Icons.person_outline, size: 20),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextField(
                            controller: _phoneController,
                            keyboardType: TextInputType.phone,
                            decoration: InputDecoration(
                              labelText: 'Phone Number *',
                              prefixIcon: const Icon(Icons.phone_outlined, size: 20),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                          const SizedBox(height: 12),
                          TextField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            decoration: InputDecoration(
                              labelText: 'Email Address (for certificate) *',
                              prefixIcon: const Icon(Icons.email_outlined, size: 20),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          ),
                          if (_collectionType == 'pickup') ...[
                            const SizedBox(height: 12),
                            TextField(
                              controller: _addressController,
                              maxLines: 2,
                              decoration: InputDecoration(
                                labelText: 'Pickup Street Address *',
                                prefixIcon: const Icon(Icons.location_on_outlined, size: 20),
                                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),

                    const SizedBox(height: 24),

                    SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                          elevation: 3,
                        ),
                        onPressed: _isSubmitting ? null : _submitDonation,
                        child: _isSubmitting
                            ? const CircularProgressIndicator(color: Colors.white)
                            : Text(
                                'Complete Clothes Donation 🎁',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w800,
                                  color: Colors.white,
                                ),
                              ),
                      ),
                    ),
                    const SizedBox(height: 30),
                  ],
                ),
              ),
            ),
    );
  }

  void _showTrackDialog() {
    final searchCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Track Donation', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700)),
        content: TextField(
          controller: searchCtrl,
          keyboardType: TextInputType.number,
          decoration: InputDecoration(
            hintText: 'Enter ID number (e.g. 1 or 2)',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () {
              final id = int.tryParse(searchCtrl.text.trim());
              if (id != null) {
                Navigator.pop(ctx);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => TrackDonationScreen(donationId: id)),
                );
              }
            },
            child: const Text('Track', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }
}
`);

// 11. TrackDonationScreen
writeDartFile('screens/donor/track_donation_screen.dart', `
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/donation_model.dart';
import '../../core/services/api_service.dart';

class TrackDonationScreen extends StatefulWidget {
  final int donationId;
  const TrackDonationScreen({super.key, required this.donationId});

  @override
  State<TrackDonationScreen> createState() => _TrackDonationScreenState();
}

class _TrackDonationScreenState extends State<TrackDonationScreen> {
  bool _isLoading = true;
  DonationModel? _donation;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    try {
      final res = await ApiService.getDonationById(widget.donationId);
      if (mounted) setState(() => _donation = res);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('Tracking #CB-\${widget.donationId}', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700)),
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18, color: AppColors.textMain),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _error != null
              ? const Center(child: Text('Donation not found.'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Text(
                                  'Status: \${_donation!.status.toUpperCase()}',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontWeight: FontWeight.w800,
                                    color: _donation!.status == 'verified' ? AppColors.primaryDark : AppColors.indigo,
                                    fontSize: 15,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryLight,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    '\${_donation!.totalPieces} pcs',
                                    style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, fontSize: 12, color: AppColors.primaryDark),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text('Campaign: \${_donation!.campaignTitle}', style: GoogleFonts.inter(fontWeight: FontWeight.w600, fontSize: 13)),
                            Text('Donor: \${_donation!.donorName} (\${_donation!.donorPhone})', style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted)),
                            if (_donation!.address != null)
                              Text('Address: \${_donation!.address}', style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 20),

                      Text('Progress Timeline', style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 12),
                      _buildStep(1, 'Submitted by Donor', 'Received in system', true),
                      _buildStep(2, 'Assigned to Field Driver', _donation!.agentName != null ? 'Driver: \${_donation!.agentName}' : 'Awaiting driver assignment', _donation!.status != 'pending'),
                      _buildStep(3, 'Picked Up from Doorstep', 'Driver collected items', _donation!.status == 'picked_up' || _donation!.status == 'delivered' || _donation!.status == 'verified'),
                      _buildStep(4, 'Delivered to Distribution Hub', 'Arrived at warehouse', _donation!.status == 'delivered' || _donation!.status == 'verified'),
                      _buildStep(5, 'Verified & Certified', 'Quality checked & certificate issued', _donation!.status == 'verified', isLast: true),

                      const SizedBox(height: 20),

                      Text('Clothes Checklist', style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.w800)),
                      const SizedBox(height: 10),
                      ..._donation!.items.map((item) => Container(
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.cardBorder),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(item.clothTypeName, style: GoogleFonts.inter(fontWeight: FontWeight.w600)),
                            Text('\${item.quantity} pieces', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, color: AppColors.indigo)),
                          ],
                        ),
                      )),
                    ],
                  ),
                ),
    );
  }

  Widget _buildStep(int stepNum, String title, String subtitle, bool isDone, {bool isLast = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: isDone ? AppColors.primary : AppColors.cardBorder,
                shape: BoxShape.circle,
              ),
              child: Center(
                child: isDone
                    ? const Icon(Icons.check, size: 16, color: Colors.white)
                    : Text('\$stepNum', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textMuted)),
              ),
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 36,
                color: isDone ? AppColors.primary : AppColors.cardBorder,
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, fontSize: 13.5, color: isDone ? AppColors.textMain : AppColors.textMuted)),
              Text(subtitle, style: GoogleFonts.inter(fontSize: 11.5, color: AppColors.textMuted)),
              const SizedBox(height: 18),
            ],
          ),
        ),
      ],
    );
  }
}
`);

// 12. AgentPickupsScreen
writeDartFile('screens/agent/agent_pickups_screen.dart', `
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/donation_model.dart';
import '../../core/services/api_service.dart';
import '../../core/services/storage_service.dart';
import '../donor/donor_home_screen.dart';

class AgentPickupsScreen extends StatefulWidget {
  const AgentPickupsScreen({super.key});

  @override
  State<AgentPickupsScreen> createState() => _AgentPickupsScreenState();
}

class _AgentPickupsScreenState extends State<AgentPickupsScreen> {
  bool _isLoading = true;
  List<DonationModel> _pickups = [];

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    try {
      final list = await ApiService.getAgentPickups();
      if (mounted) setState(() => _pickups = list);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load pickups: \$e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _callDonor(String phone) async {
    final uri = Uri.parse('tel:\$phone');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    }
  }

  Future<void> _openMap(double? lat, double? lng, String? address) async {
    Uri uri;
    if (lat != null && lng != null) {
      uri = Uri.parse('https://maps.google.com/?q=\$lat,\$lng');
    } else if (address != null && address.isNotEmpty) {
      uri = Uri.parse('https://maps.google.com/?q=\${Uri.encodeComponent(address)}');
    } else {
      return;
    }
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  Future<void> _markPickedUp(int id) async {
    try {
      await ApiService.markPickedUp(id);
      _load();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('\$e')));
      }
    }
  }

  Future<void> _markDelivered(int id) async {
    try {
      await ApiService.markDelivered(id);
      _load();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('\$e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('🚚 Field Pickup Tasks', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800)),
        backgroundColor: Colors.white,
        elevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: AppColors.rose),
            tooltip: 'Logout to Donor App',
            onPressed: () async {
              await StorageService.logout();
              if (!context.mounted) return;
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const DonorHomeScreen()),
                (route) => false,
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.sky))
          : RefreshIndicator(
              onRefresh: _load,
              child: _pickups.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.check_circle_outline, size: 64, color: AppColors.primary),
                          const SizedBox(height: 12),
                          Text('All Pickups Completed!', style: GoogleFonts.plusJakartaSans(fontSize: 18, fontWeight: FontWeight.w700)),
                          Text('No pending driver tasks assigned right now.', style: GoogleFonts.inter(color: AppColors.textMuted)),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _pickups.length,
                      itemBuilder: (ctx, i) {
                        final d = _pickups[i];
                        return Container(
                          margin: const EdgeInsets.only(bottom: 16),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.cardBorder),
                            boxShadow: const [
                              BoxShadow(color: Color(0x0A000000), blurRadius: 8, offset: Offset(0, 2)),
                            ],
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Text('#Task-\${d.id}', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 16)),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: d.status == 'assigned' ? AppColors.indigoLight : AppColors.amberLight,
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      d.status.toUpperCase(),
                                      style: GoogleFonts.inter(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w700,
                                        color: d.status == 'assigned' ? AppColors.indigo : AppColors.amber,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 10),
                              Text('👤 \${d.donorName}', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, fontSize: 15)),
                              if (d.address != null)
                                Text('📍 \${d.address}', style: GoogleFonts.inter(fontSize: 13, color: AppColors.textMuted)),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.indigo,
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    onPressed: () => _callDonor(d.donorPhone),
                                    icon: const Icon(Icons.call, size: 16, color: Colors.white),
                                    label: Text('Call Donor', style: GoogleFonts.inter(fontSize: 12, color: Colors.white)),
                                  ),
                                  const SizedBox(width: 8),
                                  OutlinedButton.icon(
                                    style: OutlinedButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                    ),
                                    onPressed: () => _openMap(d.latitude, d.longitude, d.address),
                                    icon: const Icon(Icons.directions, size: 16, color: AppColors.primary),
                                    label: Text('Open GPS Map', style: GoogleFonts.inter(fontSize: 12, color: AppColors.primary)),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 14),
                              Container(
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  color: AppColors.background,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text('👕 Total Clothes:', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                                    Text('\${d.totalPieces} pieces', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 13)),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 14),
                              if (d.status == 'assigned')
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.amber,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                    onPressed: () => _markPickedUp(d.id),
                                    child: const Text('📦 Mark as Picked Up from Donor', style: TextStyle(color: Colors.white)),
                                  ),
                                )
                              else if (d.status == 'picked_up')
                                SizedBox(
                                  width: double.infinity,
                                  child: ElevatedButton(
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: AppColors.primary,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    ),
                                    onPressed: () => _markDelivered(d.id),
                                    child: const Text('🏢 Mark Delivered to Warehouse', style: TextStyle(color: Colors.white)),
                                  ),
                                )
                              else
                                Container(
                                  width: double.infinity,
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryLight,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Center(
                                    child: Text(
                                      '✅ Delivered to Hub (Awaiting Verification)',
                                      style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.primaryDark),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
`);

// 13. AdminDashboardScreen
writeDartFile('screens/admin/admin_dashboard_screen.dart', `
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../core/constants/app_colors.dart';
import '../../core/models/donation_model.dart';
import '../../core/models/user_model.dart';
import '../../core/services/api_service.dart';
import '../../core/services/storage_service.dart';
import '../donor/donor_home_screen.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _stats;
  List<DonationModel> _donations = [];
  List<UserModel> _agents = [];
  String? _serverUrl;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _isLoading = true);
    final url = await StorageService.getBaseUrl();
    if (mounted) setState(() => _serverUrl = url);

    try {
      final stats = await ApiService.getAdminDashboard();
      final donations = await ApiService.getAdminDonations();
      final agents = await ApiService.getAgents();

      if (mounted) {
        setState(() {
          _stats = stats;
          _donations = donations;
          _agents = agents;
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load admin dashboard: \$e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showAssignDriverModal(DonationModel donation) {
    int? selectedAgentId = donation.agentId ?? (_agents.isNotEmpty ? _agents.first.id : null);
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setMState) => Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Dispatch Driver for #CB-\${donation.id}', style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              DropdownButtonFormField<int>(
                value: selectedAgentId,
                decoration: InputDecoration(
                  labelText: 'Select Field Driver',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                ),
                items: _agents.map((a) {
                  return DropdownMenuItem<int>(
                    value: a.id,
                    child: Text('\${a.name} (\${a.phone ?? a.email})'),
                  );
                }).toList(),
                onChanged: (val) => setMState(() => selectedAgentId = val),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.indigo),
                  onPressed: selectedAgentId == null
                      ? null
                      : () async {
                          Navigator.pop(ctx);
                          await ApiService.assignDriver(donation.id, selectedAgentId!);
                          _load();
                        },
                  child: const Text('Confirm Driver Assignment', style: TextStyle(color: Colors.white)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showVerifyIntakeModal(DonationModel donation) {
    final qtyCtrl = TextEditingController(text: donation.totalPieces.toString());
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Verify Intake #CB-\${donation.id}', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Confirm actual pieces received at the hub. This will trigger the Thank-You Certificate email to \${donation.donorEmail}.', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted)),
            const SizedBox(height: 12),
            TextField(
              controller: qtyCtrl,
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Verified Pieces Count',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
            onPressed: () async {
              final val = int.tryParse(qtyCtrl.text);
              if (val != null) {
                Navigator.pop(ctx);
                await ApiService.verifyIntake(donation.id, val);
                _load();
              }
            },
            child: const Text('Verify & Email Donor', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showQrPosterModal() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text('Server QR Connection Poster', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800, fontSize: 16)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Scan with any mobile device to connect to this server instance:', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted)),
            const SizedBox(height: 16),
            if (_serverUrl != null)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: AppColors.cardBorder),
                ),
                child: QrImageView(
                  data: _serverUrl!,
                  version: QrVersions.auto,
                  size: 180.0,
                ),
              ),
            const SizedBox(height: 10),
            Text(_serverUrl ?? '', style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.indigo)),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close')),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text('👑 Super Admin Control', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w800)),
        backgroundColor: Colors.white,
        elevation: 0.5,
        actions: [
          IconButton(
            icon: const Icon(Icons.qr_code, color: AppColors.indigo),
            tooltip: 'View Server QR',
            onPressed: _showQrPosterModal,
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: AppColors.rose),
            tooltip: 'Logout',
            onPressed: () async {
              await StorageService.logout();
              if (!context.mounted) return;
              Navigator.of(context).pushAndRemoveUntil(
                MaterialPageRoute(builder: (_) => const DonorHomeScreen()),
                (route) => false,
              );
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.indigo))
          : RefreshIndicator(
              onRefresh: _load,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(child: _metricTile('📦 Total Donations', _stats?['total_donations']?.toString() ?? '0', AppColors.indigoLight, AppColors.indigo)),
                        const SizedBox(width: 12),
                        Expanded(child: _metricTile('👕 Pieces Received', _stats?['total_quantity']?.toString() ?? '0', AppColors.primaryLight, AppColors.primaryDark)),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(child: _metricTile('📢 Active Drives', _stats?['active_campaigns']?.toString() ?? '0', AppColors.amberLight, AppColors.amber)),
                        const SizedBox(width: 12),
                        Expanded(child: _metricTile('🚚 Field Agents', _stats?['total_agents']?.toString() ?? '0', AppColors.skyLight, AppColors.sky)),
                      ],
                    ),
                    const SizedBox(height: 24),

                    Text('Donation Submissions Queue', style: GoogleFonts.plusJakartaSans(fontSize: 16, fontWeight: FontWeight.w800)),
                    const SizedBox(height: 12),
                    ..._donations.map((d) => Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppColors.cardBorder),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('#CB-\${d.id} • \${d.donorName}', style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, fontSize: 14)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: d.status == 'verified' ? AppColors.primaryLight : AppColors.amberLight,
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(d.status.toUpperCase(), style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700)),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          Text('Campaign: \${d.campaignTitle}', style: GoogleFonts.inter(fontSize: 12, color: AppColors.textMuted)),
                          Text('Clothes: \${d.totalPieces} pieces (\${d.collectionType})', style: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 10),
                          Row(
                            children: [
                              if (d.status == 'pending')
                                Expanded(
                                  child: ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.indigo),
                                    onPressed: () => _showAssignDriverModal(d),
                                    icon: const Icon(Icons.person_add, size: 14, color: Colors.white),
                                    label: const Text('Assign Driver', style: TextStyle(color: Colors.white, fontSize: 12)),
                                  ),
                                ),
                              if (d.status == 'delivered')
                                Expanded(
                                  child: ElevatedButton.icon(
                                    style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
                                    onPressed: () => _showVerifyIntakeModal(d),
                                    icon: const Icon(Icons.verified, size: 14, color: Colors.white),
                                    label: const Text('Verify Intake & Email', style: TextStyle(color: Colors.white, fontSize: 12)),
                                  ),
                                ),
                            ],
                          ),
                        ],
                      ),
                    )),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _metricTile(String label, String value, Color bg, Color textCol) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: textCol)),
          const SizedBox(height: 4),
          Text(value, style: GoogleFonts.plusJakartaSans(fontSize: 22, fontWeight: FontWeight.w800, color: textCol)),
        ],
      ),
    );
  }
}
`);

// 14. main.dart
writeDartFile('main.dart', `
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'core/constants/app_colors.dart';
import 'core/services/storage_service.dart';
import 'screens/qr_scanner_screen.dart';
import 'screens/donor/donor_home_screen.dart';
import 'screens/agent/agent_pickups_screen.dart';
import 'screens/admin/admin_dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final baseUrl = await StorageService.getBaseUrl();
  final user = await StorageService.getUser();

  runApp(ClothBankApp(
    initialBaseUrl: baseUrl,
    initialUserRole: user?.role,
  ));
}

class ClothBankApp extends StatelessWidget {
  final String? initialBaseUrl;
  final String? initialUserRole;

  const ClothBankApp({
    super.key,
    this.initialBaseUrl,
    this.initialUserRole,
  });

  @override
  Widget build(BuildContext context) {
    Widget homeScreen;

    if (initialBaseUrl == null || initialBaseUrl!.trim().isEmpty) {
      homeScreen = const QrScannerScreen();
    } else {
      if (initialUserRole == 'admin') {
        homeScreen = const AdminDashboardScreen();
      } else if (initialUserRole == 'agent') {
        homeScreen = const AgentPickupsScreen();
      } else {
        homeScreen = const DonorHomeScreen();
      }
    }

    return MaterialApp(
      title: 'Cloth Bank',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: AppColors.background,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
          secondary: AppColors.indigo,
          surface: AppColors.surface,
        ),
        textTheme: GoogleFonts.interTextTheme(),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.white,
          elevation: 0,
          scrolledUnderElevation: 0.5,
          iconTheme: IconThemeData(color: AppColors.textMain),
        ),
      ),
      home: homeScreen,
    );
  }
}
`);

// 15. Fix widget_test.dart
const testPath = 'D:/xampp/htdocs/flutter/cloth_bank_app/test/widget_test.dart';
fs.writeFileSync(testPath, `
import 'package:flutter_test/flutter_test.dart';
import 'package:cloth_bank_app/main.dart';

void main() {
  testWidgets('App smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const ClothBankApp());
  });
}
`, 'utf8');
console.log('Fixed: test/widget_test.dart');
console.log('Regeneration complete!');
