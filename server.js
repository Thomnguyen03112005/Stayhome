const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Thư mục chứa file HTML

// Thông tin email và mật khẩu
const EMAIL = 'codeexpoo2005@gmail.com';
const APP_PASSWORD = 'njrk pazs jhji npuc'; // Mật khẩu ứng dụng

// Tạo transporter cho Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL,
        pass: APP_PASSWORD
    }
});

// Đọc và ghi dữ liệu
const readData = () => {
    return JSON.parse(fs.readFileSync('data/userdata.json', 'utf-8'));
};

const writeData = (data) => {
    fs.writeFileSync('data/userdata.json', JSON.stringify(data, null, 2));
};

// Đọc dữ liệu diễn đàn
const readForumData = () => {
    return JSON.parse(fs.readFileSync('data/forum.json', 'utf-8'));
};

const saveForumData = (data) => {
    fs.writeFileSync('data/forum.json', JSON.stringify(data, null, 2));
};

// Đọc dữ liệu bình luận
const readCommentsData = () => {
    return JSON.parse(fs.readFileSync('data/binhluan.json', 'utf-8'));
};

// Lưu bình luận
const saveCommentsData = (data) => {
    fs.writeFileSync('data/binhluan.json', JSON.stringify(data, null, 2));
};

// Kiểm tra xem tên đăng nhập hoặc email đã tồn tại
const checkIfUserExists = (username, email) => {
    const usersData = readData();
    return usersData.datauser.some(user => user.username === username || user.name === email);
};

// Khởi tạo dữ liệu OTP
let otpData = [];

// API gửi OTP
app.post('/send-otp', (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const mailOptions = {
        from: EMAIL,
        to: email,
        subject: 'Mã OTP của bạn',
        text: `Mã OTP của bạn là: ${otp}`
    };

    transporter.sendMail(mailOptions, (error) => {
        if (error) {
            return res.status(500).send('Gửi OTP không thành công.');
        }
        otpData.push({ email, otp });
        res.status(200).send('OTP đã được gửi!');
    });
});

// API tạo tài khoản
app.post('/register', async (req, res) => {
    const { username, email, password, otp } = req.body;

    if (checkIfUserExists(username, email)) {
        return res.status(400).send('Tên đăng nhập hoặc email đã tồn tại.');
    }

    const savedOtp = otpData.find(user => user.email === email && user.otp === otp);
    if (!savedOtp) {
        return res.status(400).send('Mã OTP không chính xác.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const usersData = readData();
    usersData.datauser.push({
        id: usersData.datauser.length + 1,
        name: email,
        username: username,
        password: hashedPassword,
        role: 'members'
    });

    writeData(usersData);
    otpData = otpData.filter(user => user.email !== email);
    res.status(201).send('Tài khoản đã được tạo thành công!');
});

// API đăng nhập
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const usersData = readData();
    const user = usersData.datauser.find(user => user.name === email || user.username === email);

    if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ username: user.username });
    } else {
        res.status(401).send('Đăng nhập không thành công.');
    }
});

// Lưu hồ sơ người dùng
app.post('/saveProfile', (req, res) => {
    fs.writeFile('data/profile.json', JSON.stringify(req.body, null, 2), (err) => {
        if (err) {
            return res.status(500).send('Lỗi khi lưu file');
        }
        res.send('Lưu thành công');
    });
});

// API để lấy danh sách bài viết
app.get('/api/posts', (req, res) => {
    const data = readForumData();
    res.json(data);
});

// API để đăng bài mới
app.post('/api/posts', (req, res) => {
    const data = readForumData();
    const newPost = {
        id: data.Forum.length + 1,
        Title: req.body.Title,
        Noidung: req.body.Noidung,
        time: req.body.time,
        theloai: req.body.theloai
    };
    data.Forum.push(newPost);
    saveForumData(data);
    res.send('Đăng bài thành công!');
});

// API để lấy bài viết theo ID
app.get('/api/posts/:id', (req, res) => {
    const postId = parseInt(req.params.id, 10);
    const forumData = readForumData();
    const post = forumData.Forum.find(p => p.id === postId);
    if (post) {
        res.json(post);
    } else {
        res.status(404).send('Bài viết không tồn tại.');
    }
});

// API để lấy bình luận theo ID bài viết
app.get('/api/comments', (req, res) => {
    const postId = req.query.postId;
    const commentsData = readCommentsData();
    const comments = commentsData.binhluan.filter(comment => comment.postId == postId);
    res.json(comments);
});

// API để thêm bình luận
app.post('/api/comments', (req, res) => {
    const data = readCommentsData();
    const newComment = {
        id: data.binhluan.length + 1,
        username: req.body.username,
        noidung: req.body.noidung,
        postId: req.body.postId
    };

    data.binhluan.push(newComment);
    saveCommentsData(data);
    res.send('Bình luận đã được thêm thành công!');
});

// API để xóa bình luận
app.delete('/api/comments/:id', (req, res) => {
    const commentId = parseInt(req.params.id, 10);
    const commentsData = readCommentsData();
    commentsData.binhluan = commentsData.binhluan.filter(comment => comment.id !== commentId);
    saveCommentsData(commentsData);
    res.send('Bình luận đã được xóa.');
});

// Admin login
app.post('/admin/login', async (req, res) => {
    const { email, password } = req.body;
    const usersData = readData();
    const user = usersData.datauser.find(user => user.name === email);

    if (!user) {
        return res.status(400).send('Người dùng không tồn tại.');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).send('Mật khẩu không đúng.');
    }

    if (user.role !== 'admin') {
        return res.status(403).send('Không có quyền truy cập.');
    }

    res.status(200).json({ email: user.name, role: user.role });
});

// API để lấy dữ liệu người dùng
app.get('/api/userdata', (req, res) => {
    const usersData = readData();
    res.json(usersData);
});

// API để xóa người dùng
app.delete('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const usersData = readData();
    usersData.datauser = usersData.datauser.filter(user => user.id !== userId);
    writeData(usersData);
    res.send('Người dùng đã được xóa.');
});

// API để thay đổi vai trò
app.put('/api/users/:id/role', (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const { role } = req.body;
    const usersData = readData();
    const user = usersData.datauser.find(user => user.id === userId);
    if (user) {
        user.role = role;
        writeData(usersData);
        res.send('Vai trò đã được cập nhật.');
    } else {
        res.status(404).send('Người dùng không tồn tại.');
    }
});

// Live view
let liveUsersCount = 0;

// Middleware để đếm người dùng
app.use((req, res, next) => {
    liveUsersCount++;
    res.on('finish', () => {
        liveUsersCount--;
    });
    next();
});

// Endpoint để lấy số người dùng trực tuyến
app.get('/api/live-users', (req, res) => {
    res.json({ count: liveUsersCount });
});

// Tải lên tệp avatar
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Thư mục để lưu trữ tệp tải lên
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Tạo tên file duy nhất
    }
});

const upload = multer({ storage: storage });

app.post('/upload-avatar', upload.single('avatar'), (req, res) => {
    res.send('Tải lên thành công: ' + req.file.path);
});

// Bắt đầu server
app.listen(PORT, () => {
    console.log(`Server đang chạy trên http://localhost:${PORT}`);
});
