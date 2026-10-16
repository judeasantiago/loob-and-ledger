export const SITE = {
  name: 'Loob & Ledger',
  tagline: 'Notes on gratitude, duty, and the families that shape us.',
  url: (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || 'https://loob-and-ledger.vercel.app',
  authors: ['Judea C. Santiago', 'Rhealyn G. Pangan', 'Ahrianna Nicole G. Suaybaguio', 'Pearll Alexis P. Tagubase'],
  university: 'University of Caloocan City',
  program: 'BS Psychology, College of Liberal Arts and Sciences',
}

export const PARTS = [
  { n: 1, name: 'The Concept', blurb: 'What utang na loob is, where it comes from, and what it is not.', range: 'Posts 1–4' },
  { n: 2, name: 'The Duty', blurb: 'Family obligation, across borders and under pressure.', range: 'Posts 5–7' },
  { n: 3, name: 'The Link', blurb: 'Parents, children, and how the study tests the connection.', range: 'Posts 8–9' },
  { n: 4, name: 'The Road Ahead', blurb: 'What the numbers can and cannot tell us.', range: 'Post 10' },
] as const

export type Term = { slug: string; term: string; short: string; long: string }
export const GLOSSARY: Term[] = [
  { slug: 'utang-na-loob', term: 'Utang na loob', short: 'Deep recognition of, and gratitude for, help, care, and sacrifice received.', long: 'Literally a debt of the inner self. In the literature the proposal draws on, it is described as tied to kagandahang-loob, to gratitude, and to the wish to return kindness, and as different from a material or financial debt.' },
  { slug: 'kagandahang-loob', term: 'Kagandahang-loob', short: 'Goodness of the inner self; kindness given freely.', long: 'Discussed by Chiong (2024) as a disposition rooted in loob and kapwa, where recognizing and responding to another person’s need matters.' },
  { slug: 'kapwa', term: 'Kapwa', short: 'Shared identity with others; the self as part of a “we”.', long: 'Maninang (2025) treats kapwa as a core concept in Filipino social psychology.' },
  { slug: 'pakikisama', term: 'Pakikisama', short: 'Getting along with others; building goodwill.', long: 'Boñon (2024) discusses pakikisáma as a Filipino value that supports goodwill toward others.' },
  { slug: 'pag-unawa', term: 'Pag-unawa', short: 'Understanding; seeing another person’s situation.', long: 'Aboy (2024) links pag-unawa to the virtue of mercy, where recognizing another person’s circumstances is part of moral action.' },
  { slug: 'paninindigan', term: 'Paninindigan', short: 'Standing by one’s convictions.', long: 'Melendres (2024) presents paninindigan as an integral part of Filipino virtue ethics and of judging an action morally.' },
  { slug: 'pananagutan', term: 'Pananagutan', short: 'Responsibility; being answerable for others.', long: 'The study uses it for the sense of responsibility a child carries toward family, including help, support, and care.' },
  { slug: 'pagtanaw', term: 'Pagtanaw', short: 'Looking toward; acknowledging and returning what was received.', long: 'Appears in the proposal’s sources on firstborns’ experiences of repaying utang na loob to family (Baculi et al., 2021).' },
  { slug: 'obligasyon-sa-pamilya', term: 'Obligasyon sa pamilya', short: 'Family obligation: the duties a person has as a family member.', long: 'In the study, the responsibility to show care, give support, help, and fulfill duties within the family, financial and emotional.' },
  { slug: 'filial-piety', term: 'Filial piety', short: 'Children’s respect, care, and duty toward parents.', long: 'Kyeong et al. (2025) describe filial piety as varying across sociocultural contexts and across the life span.' },
  { slug: 'panganay', term: 'Panganay', short: 'The firstborn child.', long: 'Often expected to carry extra family responsibility; studied by Baculi et al. (2021) and Quindoza et al. (2025).' },
  { slug: 'kusang-loob', term: 'Kusang-loob', short: 'Done willingly, from one’s own free will.', long: 'The proposal stresses that utang na loob should be given kusang-loob, willingly, and not as an imposed obligation.' },
]

export type Source = { key: string; short: string; full: string; url: string }
export const SOURCES: Source[] = [
  { key: 'abogadie2025', short: 'Abogadie et al. (2025)', full: 'Abogadie, J. B., Dealca, J. Y., Repil, A. S. L., & Samoling, J. C. (2025). Impact of utang na loob concept on the Filipino young adults. International Multidisciplinary Journal of Research for Innovation, Sustainability, and Excellence (IMJRISE), 2(1), 29–36.', url: 'https://risejournals.org/index.php/imjrise/article/view/909' },
  { key: 'aboy2024', short: 'Aboy (2024)', full: 'Aboy, E. D. V. (2024). Pag-unawa and the Thomistic virtue of mercy. Philippiniana Sacra, 59(178), 15–26.', url: 'https://philsacra.ust.edu.ph/admin/downloadarticle?id=D75E65488EE6AB9CA5C05D2B56737787' },
  { key: 'baculi2021', short: 'Baculi et al. (2021)', full: 'Baculi, J. A., et al. (2021). The experiences of firstborns on pagtánaw ng utang na loob toward family. University of Baguio Research and Development Center.', url: 'https://rdc.ubaguio.edu/the-experiences-of-firstborns-on-pagtanaw-ng-utang-na-loob-toward-family/' },
  { key: 'bernardo2021', short: 'Bernardo (2021)', full: 'Bernardo, J. R. (2021). Pagsusuri sa pagpapahalaga ng “utang na loob” sa konteksto ng ugnayan sa pamilya. De La Salle University.', url: 'https://animorepository.dlsu.edu.ph/etdm_psych/18/' },
  { key: 'bonon2024', short: 'Boñon (2024)', full: 'Boñon, W. B. (2024). Pakikisáma in dialogue with Aquinas’ amicitia, i.e., charity in friendship. Philippiniana Sacra, 59(178), 27–46.', url: 'https://philsacra.ust.edu.ph/admin/downloadarticle?id=7983CA1AB525A98B135074EDE0E82B03' },
  { key: 'casilan2024', short: 'Casilan & Baclagan (2024)', full: 'Casilan, J. J., & Baclagan, T. (2024). Exploring parental expectations on children helping parents out in lower middle-income families. Theory and Practice in Child Development, 4(2), 86–113.', url: 'https://doi.org/10.46303/tpicd.2024.12' },
  { key: 'casino2025', short: 'Casiño et al. (2025)', full: 'Casiño, R. M. Z., Serrano, L., & Granada, M. I. (2025). Revisiting the Filipino value utang na loob: Contextual perceptions, implications and inputs to sustaining the Filipino psychology discussions. International Journal of Education and Humanities, 5(2), 309–324.', url: 'https://i-jeh.com/index.php/ijeh/article/view/311/201' },
  { key: 'chiong2024', short: 'Chiong (2024)', full: 'Chiong, S. (2024). A Thomistic reading of kagandahang-loób as benevolentia, beneficentia, and misericordia. Philippiniana Sacra, 59(178), 47–66.', url: 'https://philsacra.ust.edu.ph/admin/downloadarticle?id=4033659AB9EFE5FD4664884C1615CD9C' },
  { key: 'chua2022', short: 'Chua et al. (2022)', full: 'Chua, C., Gabriel, F., Bantang, J., & Llige, A. (2022). Conceptualization of Filipino family wellbeing. International Journal of Home Economics, 15(2), 103–114.', url: 'https://www.ifhe.org/fileadmin/user_upload/e_Journal/Vol_15_2_corr/P11_1.pdf' },
  { key: 'delapena2024', short: 'de la Peña (2024)', full: 'de la Peña, M. A. (2024). A dialogue on gratefulness: A study on the Filipino account of utang na loób in conversation with Aquinas’ notion of gratitude. Philippiniana Sacra, 59(178), 67–82.', url: 'https://philsacra.ust.edu.ph/admin/downloadarticle?id=4A05EBF61D70AD097C4FD9026F085097' },
  { key: 'dizon2024', short: 'Dizon & Alampay (2024)', full: 'Dizon, L. C. T., & Alampay, L. P. (2024). Family obligation moderates longitudinal associations between parental psychological control and adjustment of urban adolescents. International Journal of Behavioral Development, 48(5), 411–421.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11343579/' },
  { key: 'grava2026', short: 'Grava et al. (2026)', full: 'Grava, G., Elizabeth, V., & Keil, M. (2026). “Am I obligated to help?”: Emotions in the transnational enactment of Filipino family obligation and utang na loób in remittance-sending. New Zealand Sociology.', url: 'https://nzsociology.nz/index.php/nzs/article/view/185' },
  { key: 'ji2025', short: 'Ji (2025)', full: 'Ji, Y. (2025). Family reinstitutionalization in the early 21st century China: Bilateralism, intergenerational caregiving, and filial piety. Sociology Compass, 19(3), e70050.', url: 'https://compass.onlinelibrary.wiley.com/doi/full/10.1111/soc4.70050' },
  { key: 'kyeong2025', short: 'Kyeong et al. (2025)', full: 'Kyeong, Y., Yu, M., Tiemeier, H., Bakermans-Kranenburg, M. J., & Setoh, P. (2025). Filial piety across sociocultural context and the life span. Current Directions in Psychological Science, 34(3), 163–170.', url: 'https://journals.sagepub.com/doi/epub/10.1177/09637214241312630' },
  { key: 'lim2022', short: 'Lim & Rañola (2022)', full: 'Lim, M. J. M., & Rañola, S. L. B. M. (2022). The concept of utang na loob among select members of Generation Z in Metro Manila. De La Salle University Animo Repository.', url: 'https://animorepository.dlsu.edu.ph/cgi/viewcontent.cgi?article=1073&context=conf_shsrescon' },
  { key: 'locklear2023', short: 'Locklear et al. (2023)', full: 'Locklear, L. R., Sheridan, S., & Kong, D. T. (2023). Appreciating social science research on gratitude: An integrative review for organizational scholarship on gratitude in the workplace. Journal of Organizational Behavior, 44(2), 225–260.', url: 'https://onlinelibrary.wiley.com/doi/10.1002/job.2624' },
  { key: 'ma2026', short: 'Ma et al. (2026)', full: 'Ma, J., Du, Y., Li, C., & Lin, G. (2026). The impact of family communication patterns on filial responsibilities among college students: A chain mediation model of perceived social support and gratitude. Frontiers in Psychology, 17.', url: 'https://doi.org/10.3389/fpsyg.2026.1708482' },
  { key: 'mamayson2025', short: 'Mamayson (2025)', full: 'Mamayson, R. F. (2025). The evolving concept of filial piety in the Philippines. Philippine Journal of Nursing, 95(1).', url: 'https://drive.google.com/file/d/1cEN4tTrBN6YX9hyOS4JuP5c-Hvv6Z-Lm/view' },
  { key: 'maninang2025', short: 'Maninang (2025)', full: 'Maninang, J. (2025). On kapwa: A core concept in Filipino social psychology. Philosophia: A Journal of the Department of Philosophy, Xavier University–Ateneo de Cagayan, 3(1), 5–11.', url: 'https://philarchive.org/rec/MANOKA' },
  { key: 'melendres2024', short: 'Melendres (2024)', full: 'Melendres, I. J. G. (2024). Paninindigan as an integral part of Filipino virtue ethics. Philippiniana Sacra, 59(178), 97–114.', url: 'https://philsacra.ust.edu.ph/admin/downloadarticle?id=CB2E5241B4AEAA4C5BE4377303392746' },
  { key: 'quindoza2025', short: 'Quindoza et al. (2025)', full: 'Quindoza, T. L. V., Malcampo, M. C., & Rungduin, T. T. (2025). Narratives of utang na loob among working panganays in the Philippines. Social Transformations Journal.', url: 'https://archium.ateneo.edu/cgi/viewcontent.cgi?article=1208&context=socialtransformations' },
  { key: 'rote2024', short: 'Rote et al. (2024)', full: 'Rote, W. M., et al. (2024). Cultural values, parenting, and child adjustment in the Philippines. Journal of Family Psychology.', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC11257813/' },
  { key: 'vanhulzen2021', short: 'van Hulzen (2021)', full: 'van Hulzen, M. (2021). Gratitude and that which we cannot return: Critical reflections on gratitude. Zeitschrift für Ethik und Moralphilosophie, 4, 109–119.', url: 'https://link.springer.com/article/10.1007/s42048-021-00091-x' },
  { key: 'vishkin2025', short: 'Vishkin et al. (2025)', full: 'Vishkin, A., Kim, M. Y., Solak, N., Szymaniak, K., White, C. J. M., & Kitayama, S. (2025). Cultural variation in the motivational correlates of gratitude. Emotion, 25(1), 114–125.', url: 'https://doi.org/10.1037/emo0001425' },
  { key: 'xing2023', short: 'Xing et al. (2023)', full: 'Xing, J., Xu, X., & Wang, X. (2023). Pagsusuri sa papel ng pananagutan at paniniwala na makatarungan ang mundo sa ugnayan ng pagtanggi ng magulang at pasasalamat ng mga kabataan. Behavioral Sciences, 13(4), 305.', url: 'https://doi.org/10.3390/bs13040305' },
  { key: 'zarzycki2022', short: 'Zarzycki et al. (2022)', full: 'Zarzycki, M., Seddon, D., Bei, E., Dekel, R., & Morrison, V. (2022). How culture shapes informal caregiver motivations: A meta-ethnographic review. Qualitative Health Research, 32(10), 1574–1589.', url: 'https://journals.sagepub.com/doi/epub/10.1177/10497323221110356' },
]
export const sourceByKey = (k: string) => SOURCES.find((s) => s.key === k)
export const termBySlug = (s: string) => GLOSSARY.find((t) => t.slug === s)
