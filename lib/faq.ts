export type FaqLang = 'en' | 'ka' | 'ru';

export interface FaqItem {
  q: Record<FaqLang, string>;
  a: Record<FaqLang, string>;
}

export interface FaqCategory {
  id: string;
  icon: string;
  label: Record<FaqLang, string>;
  items: FaqItem[];
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'about',
    icon: 'info',
    label: {
      en: 'About WAYGO.ge',
      ka: 'WAYGO.ge შესახებ',
      ru: 'О WAYGO.ge',
    },
    items: [
      {
        q: {
          en: 'What is WAYGO.ge?',
          ka: 'რა არის WAYGO.ge?',
          ru: 'Что такое WAYGO.ge?',
        },
        a: {
          en: 'WAYGO.ge is a peer-to-peer (P2P) car rental marketplace in Georgia. We connect verified local car owners (hosts) with guests seeking car hire in Tbilisi, Batumi, Kutaisi, and across Georgia. Unlike traditional rental agencies, every car on WAYGO.ge is listed by a real, verified private owner.',
          ka: 'WAYGO.ge არის P2P მანქანის გაქირავების მარკეტპლეისი საქართველოში. ჩვენ ვაკავშირებთ ვერიფიცირებულ ადგილობრივ მანქანის მფლობელებს (ჰოსტებს) სტუმრებთან, რომლებიც ეძებენ მანქანის ქირაობას თბილისში, ბათუმსა, ქუთაისსა და საქართველოს მასშტაბით. ტრადიციული საქირავო სააგენტოებისგან განსხვავებით, WAYGO.ge-ზე ყოველი მანქანა განთავსებულია ნამდვილი, ვერიფიცირებული კერძო მფლობელის მიერ.',
          ru: 'WAYGO.ge — это P2P-маркетплейс аренды автомобилей в Грузии. Мы соединяем верифицированных местных владельцев автомобилей (хозяев) с гостями, ищущими прокат в Тбилиси, Батуми, Кутаиси и по всей Грузии. В отличие от традиционных прокатных агентств, каждый автомобиль на WAYGO.ge размещён реальным, верифицированным частным владельцем.',
        },
      },
      {
        q: {
          en: 'Which cities does WAYGO.ge cover?',
          ka: 'რომელ ქალაქებს ფარავს WAYGO.ge?',
          ru: 'Какие города охватывает WAYGO.ge?',
        },
        a: {
          en: 'WAYGO.ge primarily serves Tbilisi, Batumi, and Kutaisi, with cars also available in Borjomi, Gudauri, Gori, Sighnaghi, Zugdidi, and surrounding areas. All three major cities have airport pickup options at TBS, BUS, and KUT.',
          ka: 'WAYGO.ge-ს სერვისი პირველ რიგში მოიცავს თბილისს, ბათუმსა და ქუთაისს, ასევე ხელმისაწვდომია მანქანები ბორჯომში, გუდაურში, გორში, სიღნაღში, ზუგდიდსა და შემოგარენ. სამივე მთავარ ქალაქში არსებობს აეროპორტის მომსახურება — TBS, BUS და KUT.',
          ru: 'WAYGO.ge в первую очередь обслуживает Тбилиси, Батуми и Кутаиси, также доступны автомобили в Боржоми, Гудаури, Гори, Сигнахи, Зугдиди и окрестностях. Во всех трёх крупных городах доступна опция забора в аэропорту — TBS, BUS и KUT.',
        },
      },
      {
        q: {
          en: 'Is WAYGO.ge a traditional car rental agency?',
          ka: 'არის WAYGO.ge ტრადიციული საქირავო სააგენტო?',
          ru: 'WAYGO.ge — это традиционное агентство проката?',
        },
        a: {
          en: 'No. WAYGO.ge is a P2P marketplace — an intermediary platform. All cars are owned by private, verified Georgian residents who list them on the platform. WAYGO.ge handles payments, insurance, and dispute resolution, but does not own any vehicles.',
          ka: 'არა. WAYGO.ge არის P2P მარკეტპლეისი — შუამავალი პლატფორმა. ყველა მანქანა ეკუთვნის კერძო, ვერიფიცირებულ საქართველოს მაცხოვრებლებს, რომლებიც განათავსებენ მათ პლატფორმაზე. WAYGO.ge უზრუნველყოფს გადახდებს, დაზღვევასა და დავების მოგვარებას, მაგრამ თავად არ ფლობს მანქანებს.',
          ru: 'Нет. WAYGO.ge — это P2P-маркетплейс, посредническая платформа. Все автомобили принадлежат частным верифицированным жителям Грузии, размещающим их на платформе. WAYGO.ge обеспечивает платежи, страхование и урегулирование споров, но не владеет автомобилями.',
        },
      },
    ],
  },
  {
    id: 'booking',
    icon: 'calendar_month',
    label: {
      en: 'Booking & Payment',
      ka: 'ჯავშანი და გადახდა',
      ru: 'Бронирование и оплата',
    },
    items: [
      {
        q: {
          en: 'How does the booking process work?',
          ka: 'როგორ მუშაობს ჯავშნის პროცესი?',
          ru: 'Как работает процесс бронирования?',
        },
        a: {
          en: 'Browse cars by city and dates → select an insurance plan → send a booking request → the host confirms within 24 hours → pay securely through WAYGO.ge → pick up the car and complete a 7-photo condition report together.',
          ka: 'მოძებნეთ მანქანები ქალაქისა და თარიღების მიხედვით → აირჩიეთ დაზღვევის პაკეტი → გამოაგზავნეთ ჯავშნის მოთხოვნა → ჰოსტი ადასტურებს 24 საათის განმავლობაში → გადაიხადეთ WAYGO.ge-ს მეშვეობით → მიიღეთ მანქანა და ერთად შეავსეთ 7-ფოტოიანი მდგომარეობის ანგარიში.',
          ru: 'Найдите авто по городу и датам → выберите страховой план → отправьте запрос на бронь → хозяин подтверждает в течение 24 часов → оплатите через WAYGO.ge → заберите авто и вместе заполните 7-фотографный отчёт о состоянии.',
        },
      },
      {
        q: {
          en: 'What is the security deposit?',
          ka: 'რა არის დეპოზიტი?',
          ru: 'Что такое залог?',
        },
        a: {
          en: 'A 250 GEL deposit is blocked on your card at pickup. It is a hold — not a charge. It is fully released after the car is returned without damage. Even if you cancel your booking, the deposit is always returned in full.',
          ka: '250 ₾ დეპოზიტი ბლოკდება თქვენს ბარათზე მანქანის მიღებისას. ეს არის ბლოკირება — არა ჩამოჭრა. სრულად ბრუნდება მანქანის უზიანოდ დაბრუნების შემდეგ. ჯავშნის გაუქმების შემთხვევაშიც, დეპოზიტი ყოველთვის სრულად ბრუნდება.',
          ru: 'При получении авто на карте блокируется залог 250 ₾. Это блокировка, не списание. Полностью возвращается после сдачи авто без повреждений. Даже при отмене бронирования залог всегда возвращается полностью.',
        },
      },
      {
        q: {
          en: 'What is the platform fee?',
          ka: 'რა არის პლატფორმის საფასური?',
          ru: 'Что такое комиссия платформы?',
        },
        a: {
          en: 'Guests pay a 5% service fee on the total booking amount. This covers secure payments, insurance administration, and dispute mediation. The platform fee is non-refundable in all cases.',
          ka: 'სტუმრები იხდიან 5%-იან სერვისულ საფასურს ჯავშნის ჯამური თანხიდან. ეს ფარავს უსაფრთხო გადახდებს, დაზღვევის ადმინისტრირებასა და დავების შუამავლობას. პლატფორმის საფასური არ ბრუნდება არცერთ შემთხვევაში.',
          ru: 'Гости платят 5% сервисный сбор от общей суммы брони. Это покрывает безопасные платежи, администрирование страхования и посредничество при спорах. Комиссия платформы не возвращается ни в каком случае.',
        },
      },
      {
        q: {
          en: 'Can I pay the host directly, outside the platform?',
          ka: 'შემიძლია ჰოსტს პირდაპირ გადავუხადო, პლატფორმის გვერდის ავლით?',
          ru: 'Могу ли я платить хозяину напрямую?',
        },
        a: {
          en: 'No. All payments must go through WAYGO.ge. Off-platform payments are strictly prohibited and remove all protection — insurance, deposit, and dispute mediation — for both guest and host.',
          ka: 'არა. ყველა გადახდა სავალდებულოდ უნდა მოხდეს WAYGO.ge-ს მეშვეობით. პლატფორმის გვერდის ავლით გადახდა მკაცრად აკრძალულია და გამორიცხავს ყველა დაცვას — დაზღვევას, დეპოზიტს და დავების შუამავლობას — ორივე მხარისთვის.',
          ru: 'Нет. Все платежи обязательно должны проходить через WAYGO.ge. Оплата в обход платформы строго запрещена и лишает обе стороны всей защиты — страхования, залога и посредничества при спорах.',
        },
      },
    ],
  },
  {
    id: 'insurance',
    icon: 'shield',
    label: {
      en: 'Insurance & Protection',
      ka: 'დაზღვევა და დაცვა',
      ru: 'Страхование и защита',
    },
    items: [
      {
        q: {
          en: 'What insurance options are available?',
          ka: 'რა დაზღვევის ვარიანტები არსებობს?',
          ru: 'Какие варианты страхования доступны?',
        },
        a: {
          en: 'WAYGO.ge offers three tiers: Basic (0 GEL/day, 1,000 GEL deductible — included free), Standard (18 GEL/day, 400 GEL deductible), and Premium (35 GEL/day, zero deductible). You choose your plan at booking.',
          ka: 'WAYGO.ge გთავაზობთ სამ პაკეტს: Basic (0 ₾/დღე, 1 000 ₾ ფრანშიზა — უფასოდ ჩართული), Standard (18 ₾/დღე, 400 ₾ ფრანშიზა) და Premium (35 ₾/დღე, ნულოვანი ფრანშიზა). პაკეტს ირჩევთ ჯავშნისას.',
          ru: 'WAYGO.ge предлагает три уровня: Basic (0 ₾/день, франшиза 1 000 ₾ — включено бесплатно), Standard (18 ₾/день, франшиза 400 ₾) и Premium (35 ₾/день, нулевая франшиза). Вы выбираете план при бронировании.',
        },
      },
      {
        q: {
          en: 'Who pays if there is damage to the car?',
          ka: 'ვინ იხდის მანქანის დაზიანებისას?',
          ru: 'Кто платит при повреждении автомобиля?',
        },
        a: {
          en: 'The guest pays the deductible based on their plan: 0 GEL with Premium, 400 GEL with Standard, or 1,000 GEL with Basic. WAYGO.ge mediates all damage disputes using the condition report photos taken at pickup and return.',
          ka: 'სტუმარი იხდის ფრანშიზას არჩეული პაკეტის მიხედვით: 0 ₾ Premium-ით, 400 ₾ Standard-ით, ან 1 000 ₾ Basic-ით. WAYGO.ge შუამავლობს ყველა ზიანის დავაში პიქაფ-სა და დაბრუნებისას გადაღებული მდგომარეობის ანგარიშის ფოტოების გამოყენებით.',
          ru: 'Гость оплачивает франшизу по выбранному плану: 0 ₾ с Premium, 400 ₾ с Standard или 1 000 ₾ с Basic. WAYGO.ge выступает посредником во всех спорах об ущербе, используя фото отчёта о состоянии при получении и сдаче.',
        },
      },
      {
        q: {
          en: 'What is NOT covered by insurance?',
          ka: 'რა არ ფარავს დაზღვევა?',
          ru: 'Что НЕ покрывает страхование?',
        },
        a: {
          en: 'Insurance does not cover: theft of the vehicle, damage caused by driving under the influence of alcohol or drugs, off-road use not agreed with the host, war or acts of God, or damage caused by violating the host\'s rules.',
          ka: 'დაზღვევა არ ფარავს: მანქანის ქურდობას, ალკოჰოლის/ნარკოტიკების ზემოქმედებით გამოწვეულ ზიანს, ჰოსტთან შეუთანხმებელ გზისგარე გამოყენებას, ომს ან ბუნებრივ კატასტროფებს, ჰოსტის წესების დარღვევით მიყენებულ ზიანს.',
          ru: 'Страхование не покрывает: угон авто, ущерб от вождения в нетрезвом состоянии, внедорожное использование без согласования с хозяином, военные действия или стихийные бедствия, ущерб из-за нарушения правил хозяина.',
        },
      },
    ],
  },
  {
    id: 'cancellation',
    icon: 'cancel',
    label: {
      en: 'Cancellation & Refunds',
      ka: 'გაუქმება და თანხის დაბრუნება',
      ru: 'Отмена и возврат',
    },
    items: [
      {
        q: {
          en: 'What is the cancellation policy?',
          ka: 'რა არის გაუქმების პოლიტიკა?',
          ru: 'Какова политика отмены?',
        },
        a: {
          en: 'Within 1 hour of booking (grace period): 100% refund. 7+ days before pickup: 100% rental refund. 3–7 days before: 50% rental refund. 24–72 hours before: 25% refund. Under 24 hours: no refund. The platform fee is non-refundable. The security deposit is always refunded in full.',
          ka: 'ჯავშნიდან 1 საათის განმავლობაში (შეღავათიანი პერიოდი): 100% დაბრუნება. 7+ დღე ადრე: 100% ქირის დაბრუნება. 3–7 დღე ადრე: 50% ქირის დაბრუნება. 24–72 საათი ადრე: 25% დაბრუნება. 24 საათზე ნაკლები: დაბრუნება არ ხდება. პლატფორმის საფასური არ ბრუნდება. უსაფრთხოების დეპოზიტი ყოველთვის სრულად ბრუნდება.',
          ru: 'В течение 1 часа после брони (льготный период): возврат 100%. За 7+ дней до получения: возврат 100% аренды. За 3–7 дней: возврат 50%. За 24–72 ч: возврат 25%. Менее 24 часов: возврат невозможен. Комиссия платформы не возвращается. Залог всегда возвращается полностью.',
        },
      },
      {
        q: {
          en: 'What if the host cancels my booking?',
          ka: 'რა ხდება თუ ჰოსტი გააუქმებს ჩემს ჯავშანს?',
          ru: 'Что если хозяин отменит мою бронь?',
        },
        a: {
          en: 'If the host cancels a confirmed booking, you receive a full 100% refund of the rental amount and deposit. Hosts who cancel confirmed bookings receive a penalty under WAYGO.ge host rules.',
          ka: 'თუ ჰოსტი გააუქმებს დადასტურებულ ჯავშანს, თქვენ მიიღებთ ქირის თანხისა და დეპოზიტის 100%-ს. ჰოსტებს, რომლებიც გააუქმებენ დადასტურებულ ჯავშნებს, შეეფარდებათ პენალტი WAYGO.ge-ს ჰოსტის წესების მიხედვით.',
          ru: 'Если хозяин отменяет подтверждённую бронь, вы получаете полный возврат 100% суммы аренды и залога. Хозяева, отменяющие подтверждённые брони, получают штраф по правилам WAYGO.ge.',
        },
      },
    ],
  },
  {
    id: 'verification',
    icon: 'verified_user',
    label: {
      en: 'Verification & Documents',
      ka: 'ვერიფიკაცია და დოკუმენტები',
      ru: 'Верификация и документы',
    },
    items: [
      {
        q: {
          en: 'What documents do I need to rent a car?',
          ka: 'რა დოკუმენტები მჭირდება მანქანის გასაქირავებლად?',
          ru: 'Какие документы нужны для аренды автомобиля?',
        },
        a: {
          en: 'A valid driver\'s license and a national ID or passport. Before your first booking on WAYGO.ge you must complete KYC verification: upload a photo of your driver\'s license and a selfie through the platform.',
          ka: 'მოქმედი მართვის მოწმობა და პირადობის მოწმობა ან პასპორტი. WAYGO.ge-ზე პირველი ჯავშნის წინ სავალდებულოა KYC ვერიფიკაციის გავლა: ატვირთეთ მართვის მოწმობის ფოტო და სელფი პლატფორმის მეშვეობით.',
          ru: 'Действующее водительское удостоверение и удостоверение личности или паспорт. Перед первым бронированием на WAYGO.ge необходимо пройти KYC-верификацию: загрузите фото водительского удостоверения и селфи через платформу.',
        },
      },
      {
        q: {
          en: 'What is the minimum age to rent a car?',
          ka: 'რა არის მინიმალური ასაკი მანქანის გასაქირავებლად?',
          ru: 'Какой минимальный возраст для аренды авто?',
        },
        a: {
          en: 'You must be at least 18 years old and hold a valid driver\'s license.',
          ka: 'მინიმუმ 18 წლის ასაკი და მოქმედი მართვის მოწმობა სავალდებულოა.',
          ru: 'Вам должно быть не менее 18 лет и иметь действующее водительское удостоверение.',
        },
      },
      {
        q: {
          en: 'How do I become a verified host on WAYGO.ge?',
          ka: 'როგორ გავხდე ვერიფიცირებული ჰოსტი WAYGO.ge-ზე?',
          ru: 'Как стать верифицированным хозяином на WAYGO.ge?',
        },
        a: {
          en: 'Go to your dashboard and start the host verification flow: upload your national ID card (front and back) and a selfie. After admin review and approval, you can list your car on WAYGO.ge.',
          ka: 'გადადით დეშბორდზე და გაიარეთ ჰოსტის ვერიფიკაციის პროცედურა: ატვირთეთ პირადობის მოწმობა (წინა და უკანა მხარე) და სელფი. ადმინის მიერ განხილვისა და დამტკიცების შემდეგ შეძლებთ თქვენი მანქანის განთავსებას WAYGO.ge-ზე.',
          ru: 'Перейдите в личный кабинет и начните процедуру верификации хозяина: загрузите удостоверение личности (лицевую и обратную стороны) и селфи. После проверки и одобрения администратором вы сможете разместить свой автомобиль на WAYGO.ge.',
        },
      },
    ],
  },
  {
    id: 'hosts',
    icon: 'directions_car',
    label: {
      en: 'For Hosts',
      ka: 'ჰოსტებისთვის',
      ru: 'Для хозяев',
    },
    items: [
      {
        q: {
          en: 'How much do hosts earn on WAYGO.ge?',
          ka: 'რამდენს გამოიმუშავებენ ჰოსტები WAYGO.ge-ზე?',
          ru: 'Сколько зарабатывают хозяева на WAYGO.ge?',
        },
        a: {
          en: 'Standard hosts receive 90% of the rental total (platform takes 10%). Premium hosts receive 95% (platform takes 5%). Premium status was granted to hosts who registered, verified, and added their first car before June 15, 2025.',
          ka: 'სტანდარტული ჰოსტები იღებენ ქირის 90%-ს (პლატფორმა იღებს 10%-ს). პრემიუმ ჰოსტები იღებენ 95%-ს (პლატფორმა იღებს 5%-ს). პრემიუმ სტატუსი მიეცა ჰოსტებს, რომლებმაც 2025 წლის 15 ივნისამდე დარეგისტრირდნენ, გაიარეს ვერიფიკაცია და დაამატეს პირველი მანქანა.',
          ru: 'Стандартные хозяева получают 90% от суммы аренды (платформа берёт 10%). Премиум-хозяева получают 95% (платформа берёт 5%). Премиум-статус присвоен хозяевам, зарегистрировавшимся, прошедшим верификацию и добавившим первый авто до 15 июня 2025 года.',
        },
      },
      {
        q: {
          en: 'What does a host need to list a car?',
          ka: 'რა სჭირდება ჰოსტს მანქანის განთავსებისთვის?',
          ru: 'Что нужно хозяину для размещения автомобиля?',
        },
        a: {
          en: 'Hosts must complete host identity verification (national ID + selfie), provide a valid Georgian technical passport (vehicle registration) for the car, and wait for admin approval. Cars without a technical passport or with unclear ownership will be rejected.',
          ka: 'ჰოსტებმა სავალდებულოდ უნდა: გაიარონ ჰოსტის ვინაობის ვერიფიკაცია (პირადობის მოწმობა + სელფი), წარადგინონ მოქმედი ქართული ტექნიკური პასპორტი (სატრანსპორტო მოწმობა) მანქანაზე, და ელოდონ ადმინის დამტკიცებას. ტექნიკური პასპორტის ან მფლობელობის დამადასტურებელი დოკუმენტის გარეშე მანქანები უარყოფილი იქნება.',
          ru: 'Хозяева обязаны: пройти верификацию личности (удостоверение + селфи), предоставить действующий грузинский технический паспорт (тех. паспорт авто) и дождаться одобрения администратора. Авто без техпаспорта или с неясным правом собственности будут отклонены.',
        },
      },
      {
        q: {
          en: 'What happens if a guest damages my car?',
          ka: 'რა ხდება, თუ სტუმარი დაზიანებს ჩემს მანქანას?',
          ru: 'Что если гость повредит мой автомобиль?',
        },
        a: {
          en: 'You and the guest both submit condition report photos (taken at pickup and return) through WAYGO.ge. The platform reviews the evidence and mediates the dispute. The guest pays the deductible under their chosen insurance plan.',
          ka: 'თქვენ და სტუმარი ორივე წარადგენთ მდგომარეობის ანგარიშის ფოტოებს (გადაღებული პიქაფ-სა და დაბრუნებისას) WAYGO.ge-ს მეშვეობით. პლატფორმა განიხილავს მტკიცებულებებს და ახდენს დავის შუამავლობას. სტუმარი იხდის ფრანშიზას მის მიერ არჩეული დაზღვევის გეგმის მიხედვით.',
          ru: 'Вы и гость оба предоставляете фото отчёта о состоянии (сделанные при получении и сдаче) через WAYGO.ge. Платформа изучает доказательства и выступает посредником. Гость оплачивает франшизу по выбранному страховому плану.',
        },
      },
      {
        q: {
          en: 'Is airport delivery mandatory for hosts?',
          ka: 'სავალდებულოა აეროპორტის მიტანა ჰოსტებისთვის?',
          ru: 'Обязательна ли доставка в аэропорт для хозяев?',
        },
        a: {
          en: 'No. Each host sets their own airport delivery preference: free, paid at a fixed price, or not available. This is configured separately for Tbilisi (TBS), Kutaisi (KUT), and Batumi (BUS) when listing the car.',
          ka: 'არა. ყოველი ჰოსტი დამოუკიდებლად ადგენს თავის პრეფერენციას: უფასოდ, კონკრეტული ფასით, ან მიუწვდომელია. ეს ცალ-ცალკე კონფიგურდება თბილისის (TBS), ქუთაისის (KUT) და ბათუმის (BUS) მიხედვით მანქანის განთავსებისას.',
          ru: 'Нет. Каждый хозяин самостоятельно устанавливает предпочтения: бесплатно, платно по фиксированной цене или недоступно. Настраивается отдельно для Тбилиси (TBS), Кутаиси (KUT) и Батуми (BUS) при размещении авто.',
        },
      },
    ],
  },
];

// All FAQ items flattened to English for JSON-LD FAQPage
export const FAQ_ALL_EN = FAQ_CATEGORIES.flatMap(cat =>
  cat.items.map(item => ({ question: item.q.en, answer: item.a.en }))
);
