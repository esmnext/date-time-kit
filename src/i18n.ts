import type { kitDataLimit } from "./types";

export const langs = [
    'en-US',
    'zh-CN',
    'zh-TW',
    'id-ID',
    'vi-VN',
    'th-TH',
    'ms-MY',
    'ko-KR',
    'ar-AE'
] as const;
export type Lang = typeof langs[number];

export type kitI18nCfg = {
    box: {
        confirm: string;
        cancel: string;
        select: string;
    },
    quick: {
        [k in kitDataLimit]: string;
    } & {
        timezone: string;
        recommend: string;
        timezoneList: string;
    },
    date: {
        sun: string;
        mon: string;
        tue: string;
        wed: string;
        thu: string;
        fri: string;
        sat: string;
    },
    time: {
        startTime: string;
        endTime: string;
        startMillisecond: string;
        endMillisecond: string;
        singleTitle: string;
    }
};

export type kitI18n = Record<Lang, kitI18nCfg>;

const i18n: kitI18n = {
    'en-US': {
        box: {
            confirm: 'Done',
            cancel: 'Cancel',
            select: 'Select',
        },
        quick: {
            all: 'All',
            today: 'Today',
            yesterday: 'Yesterday',
            week: 'This Week',
            lastWeek: 'Last Week',
            last7Days: 'Last 7 Days',
            month: 'This Month',
            last30Days: 'Last 30 Days',
            last180Days: 'Last 180 Days',
            last6Month: 'Last 6 Month',
            year: 'This Year',
            timezone: 'Time Zone',
            recommend: 'Recommend',
            timezoneList: 'Time Zone',
        },
        date: {
            sun: 'Sun',
            mon: 'Mon',
            tue: 'Tue',
            wed: 'Wed',
            thu: 'Thu',
            fri: 'Fri',
            sat: 'Sat',
        },
        time: {
            startTime: 'Start Time',
            endTime: 'End Time',
            startMillisecond: 'Start Millisecond',
            endMillisecond: 'End Millisecond',
            singleTitle: 'Time Select'
        },
    },
    'zh-CN': {
        box: {
            confirm: '完成',
            cancel: '取消',
            select: 'Select',
        },
        quick: {
            all: '全部',
            today: '今天',
            yesterday: '昨天',
            week: '本周',
            lastWeek: '上周',
            last7Days: '最近7天',
            month: '本月',
            last30Days: '最近30天',
            last180Days: '最近180天',
            last6Month: '最近6个月',
            year: '今年',
            timezone: '时区',
            recommend: '推荐',
            timezoneList: '时区',
        },
        date: {
            sun: '日',
            mon: '一',
            tue: '二',
            wed: '三',
            thu: '四',
            fri: '五',
            sat: '六',
        },
        time: {
            startTime: '开始时间',
            endTime: '结束时间',
            startMillisecond: '毫秒',
            endMillisecond: '毫秒',
            singleTitle: '时间选择'
        },
    },
    'zh-TW': {
        box: {
            confirm: '完成',
            cancel: '取消',
            select: 'Select',
        },
        quick: {
            all: '全部',
            today: '今天',
            yesterday: '昨天',
            week: '本周',
            lastWeek: '上周',
            last7Days: '最近7天',
            month: '本月',
            last30Days: '最近30天',
            last180Days: '最近180天',
            last6Month: '最近6個月',
            year: '今年',
            timezone: '時區',
            recommend: '推薦',
            timezoneList: '時區',
        },
        date: {
            sun: '日',
            mon: '一',
            tue: '二',
            wed: '三',
            thu: '四',
            fri: '五',
            sat: '六',
        },
        time: {
            startTime: '開始時間',
            endTime: '結束時間',
            startMillisecond: '毫秒',
            endMillisecond: '毫秒',
            singleTitle: '时间选择'

        },
    },
    'id-ID': {
        quick: {
            all: 'Semua',
            today: 'Hari ini',
            yesterday: 'Kemarin',
            week: 'Minggu ini',
            lastWeek: 'Minggu lalu',
            last7Days: '7 hari terakhir',
            month: 'Bulan ini',
            last30Days: '30 hari terakhir',
            last180Days: '180 hari terakhir',
            last6Month: '6 bulan terakhir',
            year: 'Tahun ini',
            timezone: 'Zona waktu',
            recommend: 'Rekomendasi',
            timezoneList: 'Zona waktu',
        },
        date: {
            sun: 'Sun',
            mon: 'Mon',
            tue: 'Tue',
            wed: 'Wed',
            thu: 'Thu',
            fri: 'Fri',
            sat: 'Sat',
        },
        time: {
            startTime: 'Waktu Mulai',
            endTime: 'Waktu Selesai',
            startMillisecond: 'Milidetik Mulai',
            endMillisecond: 'Milidetik Selesai',
            singleTitle: '时间选择'

        },
        box: {
            confirm: 'Selesai',
            cancel: 'Batal',
            select: 'Select',
        },
    },
    'vi-VN': {
        quick: {
            all: 'Tất cả',
            today: 'Hôm nay',
            yesterday: 'Hôm qua',
            week: 'Tuần này',
            lastWeek: 'Tuần trước',
            last7Days: 'Trong 7 ngày qua',
            month: 'Tháng này',
            last30Days: 'Trong 30 ngày trước',
            last180Days: 'Trong 180 ngày trước',
            last6Month: 'Trong 6 tháng trước',
            year: 'Năm nay',
            timezone: 'Múi giờ',
            recommend: 'Gợi ý',
            timezoneList: 'Múi giờ',
        },
        date: {
            sun: 'CN',
            mon: 'T2',
            tue: 'T3',
            wed: 'T4',
            thu: 'T5',
            fri: 'T6',
            sat: 'T7',
        },
        time: {
            startTime: 'Thời gian bắt đầu',
            endTime: 'Thời gian kết thúc',
            startMillisecond: 'Mili giây bắt đầu',
            endMillisecond: 'Mili giây kết thúc',
            singleTitle: '时间选择'

        },
        box: {
            confirm: 'Hoàn tất',
            cancel: 'Hủy',
            select: 'Select',
        },
    },
    'th-TH': {
        quick: {
            all: 'ทั้งหมด',
            today: 'วันนี้',
            yesterday: 'เมื่อวาน',
            week: 'สัปดาห์นี้',
            lastWeek: 'สัปดาห์ที่แล้ว',
            last7Days: '7 วันที่ผ่านมา',
            month: 'เดือนนี้',
            last30Days: '30 วันที่ผ่านมา',
            last180Days: '180 วันที่ผ่านมา',
            last6Month: '6 เดือนที่ผ่านมา',
            year: 'ปีนี้',
            timezone: 'เขตเวลา',
            recommend: 'แนะนำ',
            timezoneList: 'เขตเวลา',
        },
        date: {
            sun: 'อา.',
            mon: 'จ.',
            tue: 'อ.',
            wed: 'พ.',
            thu: 'พฤ.',
            fri: 'ศ.',
            sat: 'ส.',
        },
        time: {
            startTime: 'เวลาเริ่มต้น',
            endTime: 'เวลาสิ้นสุด',
            startMillisecond: 'มิลลิวินาทีเริ่มต้น',
            endMillisecond: 'มิลลิวินาทีสิ้นสุด',
            singleTitle: '时间选择'

        },
        box: {
            confirm: 'เสร็จสิ้น',
            cancel: 'ยกเลิก',
            select: 'Select',
        },
    },
    'ms-MY': {
        quick: {
            all: 'Semua',
            today: 'Hari ini',
            yesterday: 'Semalam',
            week: 'Minggu ini',
            lastWeek: 'Minggu lepas',
            last7Days: '7 hari lepas',
            month: 'Bulan ini',
            last30Days: '30 hari lepas',
            last180Days: '180 hari lepas',
            last6Month: '6 bulan lepas',
            year: 'Tahun ini',
            timezone: 'Zon masa',
            recommend: 'Cadangan',
            timezoneList: 'Zon masa',
        },

        date: {
            sun: 'Sun',
            mon: 'Mon',
            tue: 'Tue',
            wed: 'Wed',
            thu: 'Thu',
            fri: 'Fri',
            sat: 'Sat',
        },
        time: {
            startTime: 'Waktu Mula',
            endTime: 'Waktu Tamat',
            startMillisecond: 'Milisaat Mula',
            endMillisecond: 'Milisaat Tamat',
            singleTitle: '时间选择'

        },
        box: {
            confirm: 'Selesai',
            cancel: 'Batal',
            select: 'Select',
        },
    },
    'ko-KR': {
        quick: {
            all: '전체',
            today: '오늘',
            yesterday: '어제',
            week: '이번주',
            lastWeek: '지난주',
            last7Days: '지난 7일',
            month: '이번달',
            last30Days: '지난 30일',
            last180Days: '지난 180일',
            last6Month: '지난 6개월',
            year: '올해',
            timezone: '시간대',
            recommend: '추천',
            timezoneList: '시간대',
        },
        date: {
            sun: '일',
            mon: '월',
            tue: '화',
            wed: '수',
            thu: '목',
            fri: '금',
            sat: '토',
        },
        time: {
            startTime: '시작 시간',
            endTime: '종료 시간',
            startMillisecond: '시작 밀리초',
            endMillisecond: '종료 밀리초',
            singleTitle: '时间选择'
        },
        box: {
            confirm: '완료',
            cancel: '취소',
            select: 'Select',
        },
    },
    'ar-AE': {
        "box": {
            "confirm": "تم",
            "cancel": "إلغاء",
            select: 'Select',
        },
        "quick": {
            "all": "الكل",
            "today": "اليوم",
            "yesterday": "أمس",
            "week": "هذا الأسبوع",
            "lastWeek": "الأسبوع الماضي",
            "last7Days": "آخر 7 أيام",
            "month": "هذا الشهر",
            "last30Days": "آخر 30 يومًا",
            "last180Days": "آخر 180 يومًا",
            "last6Month": "آخر 6 أشهر",  // 注意：阿拉伯语复数形式
            "year": "هذه السنة",
            "timezone": "المنطقة الزمنية",
            "recommend": "مُوصى به",
            "timezoneList": "قائمة المناطق الزمنية"
        },
        "date": {
            "sun": "الأحد",  // 缩写原则：使用完整单词首字母（阿拉伯语无单字缩写）
            "mon": "الاثنين",
            "tue": "الثلاثاء",
            "wed": "الأربعاء",
            "thu": "الخميس",
            "fri": "الجمعة",
            "sat": "السبت"
        },
        "time": {
            "startTime": "وقت البدء",
            "endTime": "وقت الانتهاء",
            "startMillisecond": "ميلي ثانية (بدء)",  // 技术术语补充说明
            "endMillisecond": "ميلي ثانية (انتهاء)",
            "singleTitle": "تحديد الوقت"
        }
    }
};

export default i18n;
