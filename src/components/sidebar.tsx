import { useEffect, useState } from 'react';
import { Box, VStack, Button, Heading, Link, Text, Menu, Portal, Flex } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import type { LanguageCode } from '../language/languageSelection';
import { getUserLanguage, setUserLanguage } from '../language/languageSelection';

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [lang, setLang] = useState<LanguageCode>(getUserLanguage());

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }
    if (open) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  return (
    <>
      {open && (
        <Box position="fixed" inset={0} bg="blackAlpha.400" zIndex={900} onClick={onClose} />
      )}
      <Box
        position="fixed"
        top={0}
        left={0}
        h="100dvh"
        w="260px"
        bg="white"
        borderRightWidth="1px"
        zIndex={1000}
        transform={open ? 'translateX(0)' : 'translateX(-100%)'}
        transition="transform 0.18s ease-out"
        p={4}
      >
        <VStack align="stretch" gap={3} h="full">
          <Heading size="md">{t('app.title')}</Heading>
          <Box role="separator" h="1px" bg="gray.200" />
          <Button
            variant="ghost"
            onClick={() => {
              onClose();
              navigate('/');
            }}
          >
            {t('sidebar.home')}
          </Button>
          <Button
            colorScheme="blue"
            onClick={() => {
              onClose();
              navigate('/reflect');
            }}
          >
            {t('sidebar.newReflection')}
          </Button>
          <Button
            colorScheme="blue"
            onClick={() => {
              onClose();
              navigate('/domains');
            }}
          >
            {t('sidebar.domains')}
          </Button>

          <Box flex="1" />
          <VStack align="stretch" gap={2}>
            <Box>
              <Text fontSize="xs" color="gray.500" mb={1}>
                {t('sidebar.language')}
              </Text>
              <Menu.Root>
                <Menu.Trigger asChild>
                  <Button variant="outline" size="sm" w="full" justifyContent="flex-start">
                    <Flex align="center" gap={2}>
                      <Box fontSize="lg" lineHeight={1}>
                        {lang === 'en' ? '🇬🇧' : lang === 'es' ? '🇪🇸' : '🇯🇵'}
                      </Box>
                      <Text fontSize="sm">
                        {lang === 'en' ? 'English' : lang === 'es' ? 'Español' : '日本語'}
                      </Text>
                    </Flex>
                  </Button>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content>
                      {[
                        { code: 'en', flag: '🇬🇧', label: 'English' },
                        { code: 'es', flag: '🇪🇸', label: 'Español' },
                        { code: 'ja', flag: '🇯🇵', label: '日本語' },
                      ].map((opt) => (
                        <Menu.Item
                          key={opt.code}
                          value={opt.code}
                          onClick={() => {
                            const value = opt.code as LanguageCode;
                            setLang(value);
                            setUserLanguage(value);
                            void i18n.changeLanguage(value);
                          }}
                        >
                          <Flex align="center" gap={2}>
                            <Box fontSize="lg" lineHeight={1}>
                              {opt.flag}
                            </Box>
                            <Text fontSize="sm">{opt.label}</Text>
                          </Flex>
                        </Menu.Item>
                      ))}
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            </Box>
            <Link href="https://forms.gle/b5BS5VPmf35L71Wx7" target="_blank" color="gray.500">
              {t('sidebar.feedback')}
            </Link>
            <Link
              color="gray.500"
              onClick={() => {
                onClose();
                navigate('/about');
              }}
            >
              {t('sidebar.about')}
            </Link>
          </VStack>
        </VStack>
      </Box>
    </>
  );
}
