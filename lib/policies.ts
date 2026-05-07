export type PolicyLang = 'ka' | 'en' | 'ru';

export const policies = {
  safety: {
    title: {
      ka: 'უსაფრთხოება',
      en: 'Safety',
      ru: 'Безопасность',
    },
    intro: {
      ka: 'WAYGO.ge ქმნის უსაფრთხო გარემოს როგორც ჰოსტებისთვის, ასევე სტუმრებისთვის. ქვემოთ მოცემულია ძირითადი უსაფრთხოების პრინციპები.',
      en: 'WAYGO.ge creates a safe environment for both hosts and guests. Below are the key safety principles.',
      ru: 'WAYGO.ge создаёт безопасную среду как для хозяев, так и для гостей. Ниже приведены основные принципы безопасности.',
    },
    items: [
      {
        title: { ka: 'იდენტობის ვერიფიკაცია', en: 'Identity Verification', ru: 'Проверка личности' },
        body: {
          ka: 'ყველა მომხმარებელი გადის ვერიფიკაციას. მართვის მოწმობა და სელფი გამოიყენება უსაფრთხოების უზრუნველსაყოფად.',
          en: 'All users go through verification. Driver licenses and selfies are used to ensure safety.',
          ru: 'Все пользователи проходят проверку. Водительские удостоверения и селфи используются для обеспечения безопасности.',
        },
      },
      {
        title: { ka: 'გამჭვირვალე გადახდები', en: 'Secure Payments', ru: 'Безопасные платежи' },
        body: {
          ka: 'ყველა ფინანსური ტრანზაქცია ხდება WAYGO.ge-ს პლატფორმის მეშვეობით. ჰოსტი ვერ მიიღებს გადახდას პლატფორმის გვერდის ავლით. ეს უზრუნველყოფს ორივე მხარის ფინანსურ დაცვას.',
          en: "All financial transactions go through WAYGO.ge's platform. Hosts cannot receive payment outside the platform. This ensures financial protection for both parties.",
          ru: 'Все финансовые транзакции проходят через платформу WAYGO.ge. Хозяева не могут получать оплату в обход платформы. Это обеспечивает финансовую защиту обеих сторон.',
        },
      },
      {
        title: { ka: 'ფოტო დოკუმენტაცია', en: 'Photo Documentation', ru: 'Фото-документация' },
        body: {
          ka: 'ავტომობილის გადაცემისა და დაბრუნებისას სავალდებულოა ფოტოები, რაც იცავს ორივე მხარეს დავის შემთხვევაში.',
          en: 'Photos are mandatory during handover and return, protecting both parties in case of disputes.',
          ru: 'Фотографии обязательны при передаче и возврате, что защищает обе стороны в случае споров.',
        },
      },
      {
        title: { ka: 'რეიტინგები და შეფასებები', en: 'Ratings & Reviews', ru: 'Рейтинги и отзывы' },
        body: {
          ka: 'მომხმარებლები აფასებენ ერთმანეთს, რაც ქმნის ნდობას და ზრდის პლატფორმის უსაფრთხოებას.',
          en: 'Users review each other, building trust and increasing platform safety.',
          ru: 'Пользователи оценивают друг друга, что формирует доверие и повышает безопасность платформы.',
        },
      },
    ],
  },

    guestRules: {
    back:  { ka: 'მთავარი', en: 'Home', ru: 'Главная' },
    badge: { ka: 'მოიჯარისთვის', en: 'For Renters', ru: 'Для арендаторов' },
    title: { ka: 'როგორ მუშაობს Waygo', en: 'How Waygo Works', ru: 'Как работает Waygo' },
    sub: {
      ka: 'მარტივი ნაბიჯები — მანქანის დაჯავშნიდან დაბრუნებამდე.',
      en: 'Simple steps — from booking a car to returning it.',
      ru: 'Простые шаги — от бронирования до возврата автомобиля.',
    },
    steps: [
      {
        icon: 'how_to_reg',
        accent: 'border-primary/30',
        iconBg: 'bg-primary-fixed/20 text-primary',
        title: {
          ka: 'რეგისტრაცია და ვერიფიკაცია',
          en: 'Registration & Verification',
          ru: 'Регистрация и верификация',
        },
        body: {
          ka: 'დარეგისტრირდი Waygo-ზე და გახდი ჩვენი საზოგადოების წევრი. მანქანის დასაქირავებლად საჭიროა ვერიფიკაციის გავლა, რომელიც საშუალოდ 24 საათს ან ნაკლებს მოითხოვს. გირჩევთ ვერიფიკაცია გაიაროთ რეგისტრაციისთანავე, რათა დროულად შეძლოთ სასურველი მანქანის დაჯავშნა.',
          en: 'Sign up on Waygo and become a member of our community. To rent a car, you\'ll need to complete identity verification, which typically takes up to 24 hours or less. We recommend completing verification right after registration so you\'re ready to book whenever you need.',
          ru: 'Зарегистрируйтесь на Waygo и станьте участником нашего сообщества. Для аренды автомобиля необходимо пройти верификацию личности, которая занимает до 24 часов или меньше. Рекомендуем пройти верификацию сразу после регистрации, чтобы быть готовым к бронированию в любой момент.',
        },
      },
      {
        icon: 'directions_car',
        accent: 'border-tertiary/30',
        iconBg: 'bg-tertiary-fixed/20 text-tertiary',
        title: {
          ka: 'მანქანის არჩევა და ჯავშანი',
          en: 'Choosing a Car & Booking',
          ru: 'Выбор автомобиля и бронирование',
        },
        body: {
          ka: 'აირჩიეთ სასურველი მანქანა, გაეცანით ხელმისაწვდომ სადაზღვევო პაკეტებს და შეარჩიეთ თქვენთვის შესაფერისი. დაჯავშნისთანავე თქვენს ბარათზე დაიბლოკება ქირის თანხა და დეპოზიტი. ჯავშნის მოთხოვნა გაეგზავნება გამქირავებელს, რომელსაც პასუხის გაცემისთვის 24 საათი აქვს.',
          en: 'Browse available cars, choose your preferred insurance package, and submit a booking request. Once booked, both the rental amount and deposit will be blocked on your card. The host has 24 hours to respond.',
          ru: 'Выберите понравившийся автомобиль, ознакомьтесь с доступными страховыми пакетами и оформите бронирование. После подтверждения на вашей карте будет заблокирована сумма аренды и депозит. У хозяина есть 24 часа для ответа.',
        },
        bullets: [
          {
            ka: 'გამქირავებელი დაადასტურებს — ქირის თანხა ჩამოიჭრება, დეპოზიტი კი დაბლოკილი დარჩება ქირავნობის დასრულებამდე.',
            en: 'Host confirms — the rental amount is charged and the deposit remains blocked until the rental is complete.',
            ru: 'Хозяин подтверждает — сумма аренды списывается, депозит остаётся заблокированным до окончания аренды.',
          },
          {
            ka: 'გამქირავებელი უარყოფს ან 24 საათში არ პასუხობს — ორივე თანხა ავტომატურად განიბლოკება.',
            en: 'Host declines or doesn\'t respond within 24 hours — both amounts are automatically unblocked.',
            ru: 'Хозяин отказывает или не отвечает в течение 24 часов — обе суммы автоматически разблокируются.',
          },
        ],
        tip: {
          ka: 'გაუქმების პირობების სანახავად იხილეთ გაუქმების პოლიტიკა.',
          en: 'For cancellation terms, see our Cancellation Policy.',
          ru: 'С политикой отмены можно ознакомиться на странице Условия отмены.',
        },
      },
      {
        icon: 'camera_alt',
        accent: 'border-amber-300/50',
        iconBg: 'bg-amber-50 text-amber-600',
        title: {
          ka: 'მანქანის წაყვანა',
          en: 'Picking Up the Car',
          ru: 'Получение автомобиля',
        },
        body: {
          ka: 'მანქანის წაყვანისას გადაიღეთ მანქანის დეტალური ფოტოები — ყველა მხრიდან, არსებული მდგომარეობის დასაფიქსირებლად. ფოტოების ატვირთვის შემდეგ გააქტიურდება ღილაკი „მანქანა წავიყვანე". ამ ღილაკის დაჭერისთანავე გააქტიურდება თქვენი სადაზღვევო პაკეტი.',
          en: 'When picking up the car, take detailed photos of its current condition from all sides. Once uploaded, the "I\'ve Taken the Car" button becomes active. Pressing it activates your insurance coverage.',
          ru: 'При получении автомобиля сфотографируйте его со всех сторон в текущем состоянии. После загрузки фотографий станет активной кнопка «Я забрал автомобиль». После её нажатия активируется ваша страховка.',
        },
        warning: {
          ka: 'თუ ფოტოები არ აიტვირთა და ღილაკი არ დაიჭირა, დაზღვევა არ გააქტიურდება. ფოტოები პირველ რიგში თქვენივე დაცვის საშუალებაა.',
          en: 'If photos are not uploaded and the button is not pressed, insurance will not be activated. Photos are there to protect you first and foremost.',
          ru: 'Если фотографии не загружены и кнопка не нажата, страховка не активируется. Фотографии — это прежде всего ваша собственная защита.',
        },
      },
      {
        icon: 'local_hospital',
        accent: 'border-error/20',
        iconBg: 'bg-error-container/20 text-error',
        title: {
          ka: 'ავარიის ან დაზიანების შემთხვევაში',
          en: 'In Case of an Accident or Damage',
          ru: 'В случае аварии или повреждения',
        },
        body: {
          ka: 'თუ ქირავნობის პერიოდში მოხდა ავარია ან მანქანა დაზიანდა, აუცილებელია დაუყოვნებლივ დარეკოთ 112-ზე და გამოიძახოთ პოლიცია შემთხვევის დასაფიქსირებლად. შემთხვევის დაუფიქსირებლობის შემთხვევაში მოიჯარეს დაეკისრება ზარალის სრული ანაზღაურება.',
          en: 'If an accident occurs or the car is damaged during the rental period, you must immediately call 112 and request police attendance to officially document the incident. Failure to do so will result in the renter being held fully liable for all damages.',
          ru: 'Если в период аренды произошла авария или автомобиль получил повреждения, необходимо немедленно позвонить по номеру 112 и вызвать полицию для официальной фиксации инцидента. В случае отсутствия официального протокола арендатор несёт полную ответственность за все убытки.',
        },
        tip: {
          ka: 'შემთხვევის დაფიქსირების შემდეგ სადაზღვევო კომპანია შეაფასებს ზიანს. დარჩენილი თანხა მოიჯარეს ეკისრება. სადაზღვევო პირობების სანახავად იხილეთ დაზღვევის პირობები.',
          en: 'Once documented, the insurance company will assess the damage and compensate the host. The remaining amount is the renter\'s responsibility. See Insurance Terms.',
          ru: 'После фиксации страховая компания оценит ущерб и выплатит компенсацию хозяину. Оставшаяся сумма возлагается на арендатора. См. Условия страхования.',
        },
      },
      {
        icon: 'assignment_return',
        accent: 'border-tertiary/30',
        iconBg: 'bg-tertiary-fixed/20 text-tertiary',
        title: {
          ka: 'მანქანის დაბრუნება',
          en: 'Returning the Car',
          ru: 'Возврат автомобиля',
        },
        body: {
          ka: 'მანქანის დაბრუნებისას ისევ გადაიღეთ ფოტოები და დააჭირეთ ღილაკს „მანქანა დავაბრუნე". ფოტოების გარეშე დეპოზიტი არ განიბლოკება. გამქირავებელს 24 საათი აქვს:',
          en: 'When returning the car, take photos again and press "I\'ve Returned the Car". Without photos, your deposit will not be unblocked. The host then has 24 hours to:',
          ru: 'При возврате снова сфотографируйте автомобиль и нажмите кнопку «Я вернул автомобиль». Без фотографий депозит не будет разблокирован. У хозяина есть 24 часа:',
        },
        bullets: [
          {
            ka: 'დაადასტუროს ჩაბარება — დეპოზიტი სრულად განიბლოკება.',
            en: 'Confirm the return — your deposit is fully unblocked.',
            ru: 'Подтвердить возврат — ваш депозит полностью разблокируется.',
          },
          {
            ka: 'დავა დაიწყოს — დეპოზიტი გაყინული დარჩება საკითხის გარკვევამდე.',
            en: 'Open a dispute — your deposit remains frozen until the matter is resolved.',
            ru: 'Открыть спор — депозит остаётся замороженным до выяснения обстоятельств.',
          },
        ],
      },
      {
        icon: 'gavel',
        accent: 'border-primary/20',
        iconBg: 'bg-primary-fixed/20 text-primary',
        title: {
          ka: 'დავის გადაწყვეტა',
          en: 'Dispute Resolution',
          ru: 'Разрешение споров',
        },
        body: {
          ka: 'მცირე საკითხების შემთხვევაში (ჭუჭყიანი მანქანა, ცარიელი ავზი, ჯარიმა და სხვა) Waygo ავტომატურად ჩამოაჭრის საჭირო თანხას დეპოზიტიდან და დანარჩენს განბლოკავს. თუ დეპოზიტი არ კმარა — Waygo უფლებამოსილია დამატებითი თანხა პირდაპირ ბარათიდან ჩამოაჭრას.',
          en: 'For minor issues (dirty car, empty fuel tank, traffic fines, etc.), Waygo will automatically deduct the required amount from the deposit and unblock the rest. If the deposit is insufficient, Waygo reserves the right to charge the remaining amount directly from your card.',
          ru: 'В случае незначительных проблем (грязный автомобиль, пустой бак, штрафы и т.д.) Waygo автоматически спишет необходимую сумму с депозита и разблокирует остаток. Если депозита недостаточно, Waygo вправе списать оставшуюся сумму непосредственно с вашей карты.',
        },
        tip: {
          ka: 'მსხვილი ზიანის შემთხვევაში Waygo მოიწვევს დამოუკიდებელ ექსპერტს. ექსპერტის მომსახურების ხარჯი ზარალთან ერთად მოიჯარეს დაეკისრება — ჯერ დეპოზიტიდან, შემდეგ საჭიროების შემთხვევაში ბარათიდან.',
          en: 'For significant damage, Waygo will engage an independent expert. The expert assessment cost, along with the damage amount, will be charged to the renter — first from the deposit, then from the card if needed.',
          ru: 'При значительном ущербе Waygo привлечёт независимого эксперта. Стоимость экспертизы вместе с суммой ущерба возлагается на арендатора — сначала с депозита, затем при необходимости с карты.',
        },
      },
    ],
  },
  hostRules: {
    back:  { ka: 'მთავარი', en: 'Home', ru: 'Главная' },
    badge: { ka: 'გამქირავებლისთვის', en: 'For Hosts', ru: 'Для хозяев' },
    title: { ka: 'როგორ მუშაობს Waygo', en: 'How Waygo Works', ru: 'Как работает Waygo' },
    sub: {
      ka: 'სრული სახელმძღვანელო — მანქანის განთავსებიდან შემოსავლის მიღებამდე.',
      en: 'Complete guide — from listing your car to receiving your earnings.',
      ru: 'Полное руководство — от размещения автомобиля до получения дохода.',
    },
    steps: [
      {
        icon: 'how_to_reg',
        accent: 'border-primary/30',
        iconBg: 'bg-primary-fixed/20 text-primary',
        title: {
          ka: 'რეგისტრაცია და ვერიფიკაცია',
          en: 'Registration & Verification',
          ru: 'Регистрация и верификация',
        },
        body: {
          ka: 'დარეგისტრირდი Waygo-ზე და გახდი ჩვენი საზოგადოების წევრი. მანქანის საიტზე განსათავსებლად საჭიროა გაიარო ვერიფიკაცია პირადობის მოწმობითა და სელფით. ვერიფიკაციის პასუხი მოვა 24 საათში ან ნაკლებ დროში. გირჩევთ ვერიფიკაცია გაიაროთ რეგისტრაციისთანავე.',
          en: 'Sign up on Waygo and become a member of our community. To list your car, you must complete identity verification using your ID and a selfie. You\'ll receive a response within 24 hours or less. We recommend completing verification right after registration.',
          ru: 'Зарегистрируйтесь на Waygo и станьте участником нашего сообщества. Для размещения автомобиля необходимо пройти верификацию личности с помощью удостоверения личности и селфи. Ответ придёт в течение 24 часов или раньше. Рекомендуем пройти верификацию сразу после регистрации.',
        },
        earlyAccess: {
          ka: 'Early Access — Premium სტატუსი: საიტის სრულ გაშვებამდე დარეგისტრირებული და მანქანის განმთავსებელი ჰოსტები მიიღებენ Premium სტატუსს სამუდამოდ — საკომისიო იქნება მხოლოდ 5% სტანდარტული 10%-ის ნაცვლად.',
          en: 'Early Access — Premium Status: Hosts who register and list their car before the platform\'s full public launch will receive lifetime Premium status — with a commission of just 5% instead of the standard 10%.',
          ru: 'Ранний доступ — Premium статус: Хосты, которые зарегистрируются и разместят автомобиль до полного запуска платформы, получат пожизненный Premium статус — комиссия составит всего 5% вместо стандартных 10%.',
        },
      },
      {
        icon: 'add_circle',
        accent: 'border-tertiary/30',
        iconBg: 'bg-tertiary-fixed/20 text-tertiary',
        title: {
          ka: 'მანქანის განთავსება',
          en: 'Listing Your Car',
          ru: 'Размещение автомобиля',
        },
        body: {
          ka: 'ვერიფიკაციის შემდეგ შეგიძლია დაუყოვნებლივ განათავსო მანქანა. შეავსე ყველა საჭირო ველი:',
          en: 'Once verified, you can list your car immediately. Fill in all required fields:',
          ru: 'После верификации вы можете сразу разместить автомобиль. Заполните все необходимые поля:',
        },
        bullets: [
          { icon: 'check', color: 'text-tertiary', text: { ka: 'მარკა, მოდელი, წელი', en: 'Make, model, year', ru: 'Марка, модель, год выпуска' } },
          { icon: 'check', color: 'text-tertiary', text: { ka: 'VIN კოდი', en: 'VIN code', ru: 'VIN-код' } },
          { icon: 'check', color: 'text-tertiary', text: { ka: 'კომპლექტაცია და აღჭურვილობა', en: 'Features and equipment', ru: 'Комплектация и оборудование' } },
          { icon: 'check', color: 'text-tertiary', text: { ka: 'საბაზრო ღირებულება', en: 'Market value', ru: 'Рыночная стоимость' } },
          { icon: 'check', color: 'text-tertiary', text: { ka: 'მანქანის ფოტოები', en: 'Photos of the car', ru: 'Фотографии автомобиля' } },
          { icon: 'check', color: 'text-tertiary', text: { ka: 'ტექინსპექტირების საბუთი (ორივე მხარე)', en: 'Technical inspection certificate (both sides)', ru: 'Талон технического осмотра (обе стороны)' } },
        ],
        warning: {
          ka: 'მანქანა აუცილებლად უნდა იყოს ქართულ სახელმწიფო ნომრებზე და განბაჟებული. საბაზრო ღირებულება განსაზღვრავს დეპოზიტის ოდენობას — მიუთითეთ სწორი ღირებულება. არასწორი ინფორმაციის შემთხვევაში მანქანა საიტზე არ განთავსდება.',
          en: 'Your car must be registered on Georgian plates and fully customs-cleared. Market value determines deposit amount — enter an accurate figure. Listings with incorrect information will not be approved.',
          ru: 'Автомобиль должен быть зарегистрирован на грузинских номерах и полностью растаможен. Рыночная стоимость определяет размер депозита — укажите точную сумму. Объявления с некорректной информацией размещены не будут.',
        },
        tip: {
          ka: 'განთავსების შემდეგ ადმინი დაადასტურებს მანქანას და ის გამოჩნდება საიტზე.',
          en: 'After submission, an admin will review and approve your listing before it appears on the site.',
          ru: 'После подачи заявки администратор проверит и подтвердит размещение, после чего автомобиль появится на сайте.',
        },
      },
      {
        icon: 'sell',
        accent: 'border-amber-300/50',
        iconBg: 'bg-amber-50 text-amber-600',
        title: {
          ka: 'ფასი და დაზღვევა',
          en: 'Pricing & Insurance',
          ru: 'Цена и страхование',
        },
        body: {
          ka: 'საიტზე შენი მანქანის ფასი ჩანს შენ მიერ დაწერილი დღიური ტარიფი + საბაზისო სადაზღვევო პაკეტის ღირებულება. მანქანების გვერდზე მომხმარებელს ეჩვენება „დაზღვევა შედის" — ეს კეთდება მომხმარებლის გამოცდილების გასაუმჯობესებლად.',
          en: 'Your car will be listed at your chosen daily rate plus the cost of the basic insurance package. The listing will show "Insurance Included" to improve the user experience.',
          ru: 'Ваш автомобиль будет отображаться по указанному вами дневному тарифу плюс стоимость базового страхового пакета. В объявлении будет указано «Страховка включена» для улучшения пользовательского опыта.',
        },
        tip: {
          ka: 'Waygo მანქანის ქირაზე არანაირ დამატებით თანხას არ ამატებს — ეს მხოლოდ სადაზღვევო პაკეტის ღირებულებაა. საშუალო და პრემიუმ პაკეტებზე საბაზისო პაკეტის ფასი უკვე გამოკლებულია.',
          en: 'Waygo does not add any extra charge to your rental price — this is purely the insurance cost. For standard and premium packages, the base package price is already deducted.',
          ru: 'Waygo не добавляет никаких дополнительных сборов к стоимости аренды — это исключительно стоимость страховки. Для стандартного и премиум пакетов стоимость базового пакета уже вычтена.',
        },
      },
      {
        icon: 'notifications_active',
        accent: 'border-primary/30',
        iconBg: 'bg-primary-fixed/20 text-primary',
        title: {
          ka: 'ჯავშნის მიღება',
          en: 'Receiving Booking Requests',
          ru: 'Получение запросов на бронирование',
        },
        body: {
          ka: 'როდესაც მოიჯარე დაჯავშნის შენს მანქანას, მიიღებ შეტყობინებას. გექნება 24 საათი, რათა დაადასტურო ან უარყო ჯავშანი.',
          en: 'When a guest books your car, you\'ll receive a notification. You have 24 hours to confirm or decline.',
          ru: 'Когда гость бронирует ваш автомобиль, вы получите уведомление. У вас есть 24 часа для подтверждения или отклонения.',
        },
        warning: {
          ka: '3 ან მეტი უარყოფა ერთი თვის განმავლობაში ერთი და იმავე მანქანაზე — მანქანა წაიშლება საიტიდან.',
          en: '3 or more declines on the same car within one month — the listing will be removed from the site.',
          ru: '3 и более отклонения по одному автомобилю в течение месяца — объявление будет удалено с сайта.',
        },
        tip: {
          ka: 'ჯავშნის გაუქმების სრული პირობებისთვის იხილეთ გაუქმების პოლიტიკა.',
          en: 'For full cancellation terms, see our Cancellation Policy.',
          ru: 'Полные условия отмены см. на странице Политика отмены.',
        },
      },
      {
        icon: 'event_busy',
        accent: 'border-error/20',
        iconBg: 'bg-error-container/20 text-error',
        title: {
          ka: 'ჰოსტის მხრიდან ჯავშნის გაუქმება',
          en: 'Host-Initiated Cancellations',
          ru: 'Отмена бронирования хостом',
        },
        body: {
          ka: 'თუ დადასტურებული ჯავშნის გაუქმება მოგიწევს, კლიენტს სრულად დაუბრუნდება გადახდილი თანხა საიტის საკომისიოს ჩათვლით. გაუქმების დროის მიხედვით მოქმედებს სანქციები:',
          en: 'If you need to cancel a confirmed booking, the guest will receive a full refund including the platform fee. The following penalties apply based on timing:',
          ru: 'Если вам необходимо отменить подтверждённое бронирование, гость получит полный возврат средств включая комиссию платформы. В зависимости от времени отмены применяются санкции:',
        },
        bullets: [
          {
            icon: 'check_circle',
            color: 'text-tertiary',
            text: {
              ka: 'მანქანის წაყვანამდე 48 საათზე მეტი — სანქცია არ არის.',
              en: 'More than 48 hours before pickup — no penalty.',
              ru: 'Более 48 часов до получения — санкций нет.',
            },
          },
          {
            icon: 'warning',
            color: 'text-amber-600',
            text: {
              ka: '24–48 საათი — შენი შემდეგი 2 ჯავშნის საკომისიო გახდება 15%.',
              en: '24–48 hours before pickup — your next 2 bookings will be charged 15% commission.',
              ru: 'За 24–48 часов — комиссия по следующим 2 бронированиям составит 15%.',
            },
          },
          {
            icon: 'warning',
            color: 'text-orange-600',
            text: {
              ka: '24 საათზე ნაკლები — შენი შემდეგი 2 ჯავშნის საკომისიო გახდება 20%.',
              en: 'Less than 24 hours before pickup — your next 2 bookings will be charged 20% commission.',
              ru: 'Менее чем за 24 часа — комиссия по следующим 2 бронированиям составит 20%.',
            },
          },
          {
            icon: 'cancel',
            color: 'text-error',
            text: {
              ka: 'თვეში 3 ან მეტი გაუქმება — ანგარიში დაიბლოკება გარკვევამდე.',
              en: '3 or more cancellations in one month — your account will be suspended pending review.',
              ru: '3 и более отмены в течение месяца — аккаунт будет заблокирован до выяснения обстоятельств.',
            },
          },
        ],
      },
      {
        icon: 'car_rental',
        accent: 'border-tertiary/30',
        iconBg: 'bg-tertiary-fixed/20 text-tertiary',
        title: {
          ka: 'მანქანის გადაცემა',
          en: 'Handing Over the Car',
          ru: 'Передача автомобиля',
        },
        body: {
          ka: 'მანქანის გადაცემისას მოუწოდე მოიჯარეს გადაიღოს ფოტოები და დააჭიროს ღილაკს „მანქანა წავიყვანე" — ეს აუცილებელია დაზღვევის გასააქტიურებლად და ორივე მხარის დასაცავად. ამ ღილაკის დაჭერის შემდეგ მიიღებ ქირის თანხის პირველ 50%-ს.',
          en: 'When handing over the car, remind the guest to take photos and press "I\'ve Taken the Car" — this is required to activate insurance and protects both parties. Once pressed, you will receive the first 50% of the rental amount.',
          ru: 'При передаче автомобиля напомните гостю сфотографировать машину и нажать кнопку «Я забрал автомобиль» — это необходимо для активации страховки и защиты обеих сторон. После нажатия кнопки вы получите первые 50% суммы аренды.',
        },
        tip: {
          ka: 'სადაზღვევო პირობების სანახავად იხილეთ დაზღვევის პირობები.',
          en: 'For insurance terms, see Insurance Terms.',
          ru: 'Условия страхования см. на странице Условия страхования.',
        },
      },
      {
        icon: 'local_hospital',
        accent: 'border-error/20',
        iconBg: 'bg-error-container/20 text-error',
        title: {
          ka: 'ავარიის ან დაზიანების შემთხვევაში',
          en: 'In Case of Accident or Damage',
          ru: 'В случае аварии или повреждения',
        },
        body: {
          ka: 'თუ ქირავნობის პერიოდში მოხდა ავარია ან დაზიანება, მოიჯარე ვალდებულია დაუყოვნებლივ დარეკოს 112-ზე შემთხვევის დასაფიქსირებლად. შემთხვევის დაფიქსირების შემდეგ სადაზღვევო კომპანია შეაფასებს ზიანს და გადაგიხდის არჩეული პაკეტის შესაბამის პროცენტს. დარჩენილი თანხა მოიჯარეს დაეკისრება.',
          en: 'If an accident or damage occurs during the rental, the guest is required to immediately call 112 to officially document the incident. The insurance company will then assess the damage and compensate you according to the guest\'s chosen package percentage. The remaining amount is the guest\'s responsibility.',
          ru: 'Если в период аренды произошла авария или повреждение, гость обязан немедленно позвонить по номеру 112 для официальной фиксации инцидента. После этого страховая компания оценит ущерб и выплатит вам компенсацию согласно выбранному гостем страховому пакету. Оставшаяся сумма возлагается на гостя.',
        },
        tip: {
          ka: 'სადაზღვევო პირობების სანახავად იხილეთ დაზღვევის პირობები.',
          en: 'For full details, see Insurance Terms.',
          ru: 'Подробнее см. Условия страхования.',
        },
      },
      {
        icon: 'assignment_return',
        accent: 'border-primary/30',
        iconBg: 'bg-primary-fixed/20 text-primary',
        title: {
          ka: 'მანქანის ჩაბარება',
          en: 'Car Return',
          ru: 'Возврат автомобиля',
        },
        body: {
          ka: 'მოიჯარის დაბრუნებისას მოუწოდე ფოტოების გადაღებას და ღილაკს „მანქანა დავაბრუნე" დაჭერას. შემდეგ გექნება 24 საათი:',
          en: 'When the guest returns the car, remind them to take photos and press "I\'ve Returned the Car". You then have 24 hours to:',
          ru: 'При возврате автомобиля напомните гостю сфотографировать машину и нажать кнопку «Я вернул автомобиль». После этого у вас есть 24 часа:',
        },
        bullets: [
          {
            icon: 'check_circle',
            color: 'text-tertiary',
            text: {
              ka: 'დაადასტურე ჩაბარება — მიიღებ ქირის დარჩენილ 50%-ს, კლიენტს განებლოკება დეპოზიტი.',
              en: 'Confirm the return — you receive the remaining 50% of the rental, guest\'s deposit is unblocked.',
              ru: 'Подтвердить возврат — вы получаете оставшиеся 50% суммы аренды, депозит гостя разблокируется.',
            },
          },
          {
            icon: 'gavel',
            color: 'text-error',
            text: {
              ka: 'დავა დაიწყე — დეპოზიტი გაყინული დარჩება საკითხის გარკვევამდე.',
              en: 'Open a dispute — the deposit remains frozen until the matter is resolved.',
              ru: 'Открыть спор — депозит остаётся замороженным до выяснения обстоятельств.',
            },
          },
        ],
        tip: {
          ka: 'დავის შემთხვევაში Waygo შეაფასებს სიტუაციას. მსხვილი ზიანისთვის მოიწვევა დამოუკიდებელი ექსპერტი. Waygo მოგაწვდის ყველა საჭირო დოკუმენტაციას და ინფორმაციას.',
          en: 'In case of dispute, Waygo will assess the situation. For significant damage, an independent expert will be engaged. Waygo will provide all necessary documentation to support you.',
          ru: 'В случае спора Waygo оценит ситуацию. При значительном ущербе будет привлечён независимый эксперт. Waygo предоставит все необходимые документы и информацию для защиты ваших интересов.',
        },
      },
    ],
  },

  insuranceTerms: {
    back: {
      ka: 'მთავარი',
      en: 'Home',
      ru: 'Главная',
    },
    title: {
      ka: 'დაზღვევის პირობები',
      en: 'Insurance Terms',
      ru: 'Условия страхования',
    },
    lastUpdated: {
      ka: 'ბოლო განახლება: მაისი 2026',
      en: 'Last updated: May 2026',
      ru: 'Обновлено: май 2026',
    },
    intro: {
      ka: 'ყოველი ჯავშანი WAYGO.ge-ზე ავტომატურად მოიცავს სადაზღვევო გეგმას. სამი გეგმიდან ერთ-ერთს სტუმარი ირჩევს ჯავშნის განთავსებისას. ქვემოთ მოცემულია სრული ინფორმაცია თითოეული გეგმის შესახებ.',
      en: 'Every booking on WAYGO.ge automatically includes an insurance plan. One of three plans is chosen by the guest when booking. Below is full information about each plan.',
      ru: 'Каждое бронирование на WAYGO.ge автоматически включает страховой план. Один из трёх планов выбирается гостем при бронировании. Ниже приведена полная информация о каждом плане.',
    },
    plansTitle: {
      ka: 'სამი სადაზღვევო გეგმა',
      en: 'Three Insurance Plans',
      ru: 'Три страховых плана',
    },
    included: {
      ka: 'შედის',
      en: 'Included',
      ru: 'Включено',
    },
    notCovered: {
      ka: 'არ ფარავს',
      en: 'Not covered',
      ru: 'Не покрывает',
    },
    generalTitle: {
      ka: 'ზოგადი პირობები',
      en: 'General Terms',
      ru: 'Общие условия',
    },
    disclaimer: {
      ka: 'WAYGO.ge-ის სადაზღვევო გეგმა წარმოადგენს პლატფორმის შიდა პოლიტიკას. კომპლექსური სადაზღვევო საჭიროებებისთვის, გირჩევთ, დამოუკიდებელ სადაზღვევო კომპანიას მიმართოთ. კითხვებისთვის: support@waygo.ge',
      en: 'WAYGO.ge\'s insurance plan is an internal platform policy. For complex insurance needs, we recommend consulting an independent insurance company. Questions: support@waygo.ge',
      ru: 'Страховой план WAYGO.ge является внутренней политикой платформы. Для сложных страховых потребностей рекомендуем обратиться в независимую страховую компанию. По вопросам: support@waygo.ge',
    },
    plans: [
      {
        key: 'basic',
        icon: 'security',
        color: 'border-slate-200',
        badge: 'bg-slate-100 text-slate-600',
        label: { ka: 'Basic', en: 'Basic', ru: 'Basic' },
        deductible: '500 ₾',
        price: { ka: 'ყველაზე ხელმისაწვდომი', en: 'Most affordable', ru: 'Наиболее доступный' },
        features: [
          { ka: 'ქონებრივი ზიანის დაფარვა', en: 'Property damage coverage', ru: 'Покрытие ущерба имуществу' },
          { ka: 'ავარიის შემთხვევაში — ჰოსტის ავტომობილის შეკეთება', en: 'Car repair in case of accident', ru: 'Ремонт автомобиля хозяина при аварии' },
          { ka: 'ფრანშიზი: 500 ₾', en: 'Deductible: 500 ₾', ru: 'Франшиза: 500 ₾' },
        ],
        notCovered: [
          { ka: 'ქურდობა', en: 'Theft', ru: 'Угон' },
          { ka: 'განზრახი ზიანი', en: 'Intentional damage', ru: 'Умышленный ущерб' },
        ],
      },
      {
        key: 'standard',
        icon: 'verified_user',
        color: 'border-primary/40',
        badge: 'bg-primary-fixed/30 text-primary',
        label: { ka: 'Standard', en: 'Standard', ru: 'Standard' },
        deductible: '300 ₾',
        price: { ka: 'ოპტიმალური არჩევანი', en: 'Optimal choice', ru: 'Оптимальный выбор' },
        features: [
          { ka: 'ქონებრივი ზიანის დაფარვა', en: 'Property damage coverage', ru: 'Покрытие ущерба имуществу' },
          { ka: 'ავარიის შემთხვევაში — ჰოსტის ავტომობილის შეკეთება', en: 'Car repair in case of accident', ru: 'Ремонт автомобиля при аварии' },
          { ka: 'ქურდობის დაფარვა', en: 'Theft coverage', ru: 'Покрытие угона' },
          { ka: 'ფრანშიზი: 300 ₾', en: 'Deductible: 300 ₾', ru: 'Франшиза: 300 ₾' },
        ],
        notCovered: [
          { ka: 'განზრახი ზიანი', en: 'Intentional damage', ru: 'Умышленный ущерб' },
        ],
      },
      {
        key: 'premium',
        icon: 'workspace_premium',
        color: 'border-amber-400/60',
        badge: 'bg-amber-50 text-amber-700',
        label: { ka: 'Premium', en: 'Premium', ru: 'Premium' },
        deductible: '150 ₾',
        price: { ka: 'მაქსიმალური დაცვა', en: 'Maximum protection', ru: 'Максимальная защита' },
        features: [
          { ka: 'ყოვლისმომცველი ქონებრივი ზიანის დაფარვა', en: 'Comprehensive property damage coverage', ru: 'Полное покрытие ущерба имуществу' },
          { ka: 'ავარიის შემთხვევაში — ჰოსტის ავტომობილის შეკეთება', en: 'Car repair in case of accident', ru: 'Ремонт автомобиля при аварии' },
          { ka: 'ქურდობის დაფარვა', en: 'Theft coverage', ru: 'Покрытие угона' },
          { ka: 'მინიმალური ფრანშიზი: 150 ₾', en: 'Minimum deductible: 150 ₾', ru: 'Минимальная франшиза: 150 ₾' },
          { ka: 'პრიორიტეტული მხარდაჭერა', en: 'Priority support', ru: 'Приоритетная поддержка' },
        ],
        notCovered: [],
      },
    ],
    general: [
      {
        icon: 'lock',
        title: { ka: 'დეპოზიტი — ყველა გეგმაში', en: 'Deposit — for all plans', ru: 'Депозит — для всех планов' },
        body: {
          ka: 'ყოველ ჯავშანზე ბლოკდება 250 ₾ სადეპოზიტო უზრუნველყოფა. ქირავნობის ბოლოს, ზიანის გარეშე დაბრუნებისას, 250 ₾ სრულად ბრუნდება.',
          en: 'A 250 ₾ deposit hold is applied to every booking. At the end of the rental, if returned without damage, 250 ₾ is fully returned.',
          ru: 'На каждое бронирование блокируется залог в размере 250 ₾. По окончании аренды, при возврате без повреждений, 250 ₾ полностью возвращается.',
        },
      },
      {
        icon: 'percent',
        title: { ka: '5% საკომისიო', en: '5% Platform Fee', ru: '5% комиссия платформы' },
        body: {
          ka: 'WAYGO.ge-ის 5%-იანი საკომისიო ქირავნობის ღირებულებიდან — გაუქმების შემთხვევაში — არ ბრუნდება. ეს ფარავს ჩვენი პლატფორმის ადმინისტრაციულ ხარჯებს.',
          en: 'WAYGO.ge\'s 5% commission on the rental amount — in case of cancellation — is non-refundable. This covers our platform\'s administrative costs.',
          ru: 'Комиссия WAYGO.ge в размере 5% от стоимости аренды — при отмене — не возвращается. Она покрывает административные расходы нашей платформы.',
        },
      },
      {
        icon: 'emergency',
        title: { ka: 'გამონაკლისები', en: 'Exclusions', ru: 'Исключения' },
        body: {
          ka: 'სადაზღვევო გეგმა არ ფარავს: სამხედრო მოქმედებებს, ბუნებრივ კატასტროფებს, მძღოლის ნარკოტიკული ან ალკოჰოლური ინტოქსიკაციას, ავტომობილის კომერციულ გამოყენებას, ან სახელმძღვანელო წესების განმეორებადი დარღვევებს.',
          en: 'Insurance does not cover: military actions, natural disasters, driver intoxication by drugs or alcohol, commercial use of the vehicle, or repeated violations of the guest rules.',
          ru: 'Страхование не покрывает: военные действия, стихийные бедствия, опьянение водителя наркотиками или алкоголем, коммерческое использование транспортного средства или повторные нарушения правил для гостей.',
        },
      },
      {
        icon: 'info',
        title: { ka: 'დაზღვევის გააქტიურება', en: 'Insurance Activation', ru: 'Активация страховки' },
        body: {
          ka: 'სადაზღვევო გეგმა გააქტიურდება ჰოსტის მიერ ჯავშნის დადასტურების შემდეგ. ჯავშნის "awaiting_host" სტადიაზე, დაზღვევა ჯერ "inactive" სტატუსშია.',
          en: 'The insurance plan is activated after the host confirms the booking. While the booking is in "awaiting_host" status, the insurance is still "inactive".',
          ru: 'Страховой план активируется после подтверждения бронирования хозяином. Пока бронирование находится в статусе "awaiting_host", страховка ещё "inactive".',
        },
      },
    ],
  },

  cancellationPolicy: {
    back: {
      ka: 'მთავარი',
      en: 'Home',
      ru: 'Главная',
    },
    title: {
      ka: 'გაუქმების პოლიტიკა',
      en: 'Cancellation Policy',
      ru: 'Политика отмены',
    },
    lastUpdated: {
      ka: 'ბოლო განახლება: მაისი 2026',
      en: 'Last updated: May 2026',
      ru: 'Обновлено: май 2026',
    },
    intro: {
      ka: 'WAYGO-ს გაუქმების პოლიტიკა შექმნილია ჰოსტებისა და სტუმრების ინტერესების დასაბალანსებლად. ქვემოთ მოცემულია სრული ინფორმაცია თანხის დაბრუნების შესახებ.',
      en: 'WAYGO\'s cancellation policy is designed to fairly balance the interests of hosts and guests. Below is the full refund schedule.',
      ru: 'Политика отмены WAYGO разработана для справедливого баланса интересов хозяев и гостей. Ниже приведена полная информация о возвратах.',
    },
    refundScheduleTitle: {
      ka: 'დაბრუნების განრიგი',
      en: 'Refund Schedule',
      ru: 'График возвратов',
    },
    rentalRefund: {
      ka: 'ქირის დაბრუნება',
      en: 'rental refund',
      ru: 'возврат аренды',
    },
    deposit: {
      ka: 'დეპოზიტი',
      en: 'deposit',
      ru: 'залог',
    },
    keyRulesTitle: {
      ka: 'მნიშვნელოვანი პირობები',
      en: 'Key Rules',
      ru: 'Ключевые условия',
    },
    exampleTitle: {
      ka: 'გაანგარიშების მაგალითი',
      en: 'Example Calculation',
      ru: 'Пример расчёта',
    },
    exampleSubtitle: {
      ka: '5-დღიანი დაჯავშნა · 400 ₾ + 21 ₾ (5% საკომისიო) = 421 ₾ სულ',
      en: '5-day rental · 400 ₾ + 20 ₾ (5% fee) = 420 ₾ total',
      ru: '5-дневная аренда · 400 ₾ + 20 ₾ (комиссия 5%) = 420 ₾ итого',
    },
    rentalPlusDeposit: {
      ka: 'ქირა + დეპოზიტი',
      en: 'rental + deposit',
      ru: 'аренда + залог',
    },
    contactTitle: {
      ka: 'კითხვა გაქვს?',
      en: 'Have a question?',
      ru: 'Есть вопросы?',
    },
    contactBody: {
      ka: 'დაგვიკავშირდი: ',
      en: 'Contact us at ',
      ru: 'Свяжитесь с нами: ',
    },
    tierLabels: {
      en: {
        pre_approval: 'Pre-approval',
        grace_period: 'Grace period',
        early: 'Early cancel',
        standard: 'Standard',
        late: 'Late cancel',
        no_refund: 'No refund',
      },
      ka: {
        pre_approval: 'ჰოსტის დადასტურებამდე',
        grace_period: 'თავისუფალი ვადა',
        early: 'ადრეული გაუქმება',
        standard: 'სტანდარტული',
        late: 'გვიანი გაუქმება',
        no_refund: 'თანხა არ ბრუნდება',
      },
      ru: {
        pre_approval: 'До подтверждения',
        grace_period: 'Льготный период',
        early: 'Ранняя отмена',
        standard: 'Стандарт',
        late: 'Поздняя отмена',
        no_refund: 'Без возврата',
      },
    },
    tiers: [
      {
        tier: 'pre_approval',
        window: {
          ka: 'Before host approval',
          en: 'Before host approval',
          ru: 'Before host approval',
        },
        refundPct: 100,
        fee: 'Non-refundable (5%)',
        deposit: 'Fully returned',
        icon: 'check_circle',
        badgeCls: 'bg-tertiary-fixed/30 text-tertiary',
      },
      {
        tier: 'grace_period',
        window: {
          ka: 'Within 24 h of booking & pickup ≥ 7 days away',
          en: 'Within 24 h of booking & pickup ≥ 7 days away',
          ru: 'Within 24 h of booking & pickup ≥ 7 days away',
        },
        refundPct: 100,
        fee: 'Non-refundable (5%)',
        deposit: 'Fully returned',
        icon: 'check_circle',
        badgeCls: 'bg-tertiary-fixed/30 text-tertiary',
      },
      {
        tier: 'early',
        window: {
          ka: '5+ days before pickup',
          en: '5+ days before pickup',
          ru: '5+ days before pickup',
        },
        refundPct: 75,
        fee: 'Non-refundable (5%)',
        deposit: 'Fully returned',
        icon: 'info',
        badgeCls: 'bg-primary-fixed/30 text-primary',
      },
      {
        tier: 'standard',
        window: {
          ka: '3–4 days before pickup',
          en: '3–4 days before pickup',
          ru: '3–4 days before pickup',
        },
        refundPct: 50,
        fee: 'Non-refundable (5%)',
        deposit: 'Fully returned',
        icon: 'info',
        badgeCls: 'bg-amber-50 text-amber-700',
      },
      {
        tier: 'late',
        window: {
          ka: '24 h–2 days before pickup',
          en: '24 h–2 days before pickup',
          ru: '24 h–2 days before pickup',
        },
        refundPct: 25,
        fee: 'Non-refundable (5%)',
        deposit: 'Fully returned',
        icon: 'warning',
        badgeCls: 'bg-orange-50 text-orange-700',
      },
      {
        tier: 'no_refund',
        window: {
          ka: 'Less than 24 h before pickup',
          en: 'Less than 24 h before pickup',
          ru: 'Less than 24 h before pickup',
        },
        refundPct: 0,
        fee: 'Non-refundable (5%)',
        deposit: 'Fully returned',
        icon: 'cancel',
        badgeCls: 'bg-error-container/30 text-error',
      },
    ],
    keyRules: [
      {
        icon: 'percent',
        title: {
          ka: '5% სერვის საკომისიო არ ბრუნდება',
          en: '5% platform fee is never refunded',
          ru: '5% комиссия не возвращается',
        },
        body: {
          ka: 'WAYGO-ს საკომისიო (ქირის ჯამის 5%) ყოველთვის ინარჩუნებს, გაუქმების დროს მიუხედავად.',
          en: 'The platform service fee (5% of rental total) is retained in all cancellation scenarios.',
          ru: 'Комиссия платформы (5% от стоимости аренды) удерживается при любой отмене.',
        },
      },
      {
        icon: 'account_balance_wallet',
        title: {
          ka: 'დეპოზიტი ყოველთვის ბრუნდება',
          en: 'Deposit is always returned',
          ru: 'Залог всегда возвращается',
        },
        body: {
          ka: '250 ₾ დეპოზიტი სრულად ბრუნდება ნებისმიერი გაუქმებისას, სანამ მანქანა ჩაბარებული არ არის.',
          en: 'The 250 ₾ deposit is returned in full for any cancellation before the car is picked up.',
          ru: 'Залог 250 ₾ возвращается полностью при любой отмене до получения автомобиля.',
        },
      },
      {
        icon: 'schedule',
        title: {
          ka: 'გაუქმება შეუძლებელია ჩაბარების შემდეგ',
          en: 'No cancellation after pickup',
          ru: 'Отмена невозможна после получения',
        },
        body: {
          ka: 'მას შემდეგ, რაც სტუმარი ამ ავტომობილს ჩაიბარებს (სტატუსი "Confirmed"), გაუქმება შეუძლებელია.',
          en: 'Once the guest has picked up the car (status "Confirmed"), the booking cannot be cancelled.',
          ru: 'После получения автомобиля (статус «Подтверждено») отмена бронирования невозможна.',
        },
      },
      {
        icon: 'verified_user',
        title: {
          ka: 'კოდით დასტური გაუქმებისთვის',
          en: 'Code verification required to cancel',
          ru: 'Подтверждение по коду',
        },
        body: {
          ka: 'გაუქმების დასადასტურებლად 6-ნიშნა კოდი გაიგზავნება თქვენს ელფოსტაზე. კოდი 10 წუთის განმავლობაში მოქმედებს.',
          en: 'To confirm cancellation, a 6-digit verification code is emailed to you. Codes expire after 10 minutes.',
          ru: 'Для подтверждения отмены на вашу почту будет отправлен 6-значный код. Код действителен 10 минут.',
        },
      },
      {
        icon: 'payments',
        title: {
          ka: 'თანხის დაბრუნება 3–5 სამუშაო დღეში',
          en: 'Refunds within 3–5 business days',
          ru: 'Возврат за 3–5 рабочих дней',
        },
        body: {
          ka: 'თანხა სრულად ბრუნდება 3–5 სამუშაო დღის განმავლობაში, ბარათის გამომსცემლის პოლიტიკის შესაბამისად.',
          en: 'Refunds are issued to the original payment method within 3–5 business days, subject to your card issuer.',
          ru: 'Средства зачисляются обратно на карту в течение 3–5 рабочих дней в зависимости от политики банка.',
        },
      },
    ],
    exampleRows: [
      {
        scenario: {
          ka: 'ჰოსტის მოწვ. დასრულებამდე',
          en: 'Before host approval',
          ru: 'До одобрения хозяина',
        },
        refund: '400 ₾ + 250 ₾',
        total: '650 ₾',
        cls: 'text-tertiary',
      },
      {
        scenario: {
          ka: '5+ დღე აყვანამდე (75%)',
          en: '5+ days before pickup (75%)',
          ru: '5+ дней до получения (75%)',
        },
        refund: '300 ₾ + 250 ₾',
        total: '550 ₾',
        cls: 'text-primary',
      },
      {
        scenario: {
          ka: '3–4 დღე (50%)',
          en: '3–4 days before pickup (50%)',
          ru: '3–4 дня (50%)',
        },
        refund: '200 ₾ + 250 ₾',
        total: '450 ₾',
        cls: 'text-amber-700',
      },
      {
        scenario: {
          ka: '1–2 დღე (25%)',
          en: '1–2 days before pickup (25%)',
          ru: '1–2 дня (25%)',
        },
        refund: '100 ₾ + 250 ₾',
        total: '350 ₾',
        cls: 'text-orange-700',
      },
      {
        scenario: {
          ka: '24 სთ-ზე ნაკლები (0%)',
          en: 'Less than 24 h (0%)',
          ru: 'Менее 24 ч (0%)',
        },
        refund: '0 ₾ + 250 ₾',
        total: '250 ₾',
        cls: 'text-error',
      },
    ],
  },

} as const;