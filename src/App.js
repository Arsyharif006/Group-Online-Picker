import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Play, Shuffle, CheckCircle, Star, AlertCircle, ArrowDown, LoaderPinwheel } from 'lucide-react';

const GroupDividerApp = () => {
  const [numGroups, setNumGroups] = useState('0');
  const [peoplePerGroup, setPeoplePerGroup] = useState('0');
  const [maleNames, setMaleNames] = useState('');
  const [femaleNames, setFemaleNames] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showRemainderPhase, setShowRemainderPhase] = useState(false);
  const [showRemainderPopup, setShowRemainderPopup] = useState(false);
  const [showGroupSelectionPopup, setShowGroupSelectionPopup] = useState(false);
  const [remainderRevealIndex, setRemainderRevealIndex] = useState(0);
  const [groupSelectionData, setGroupSelectionData] = useState({
    currentMemberIndex: 0,
    isAnimating: false,
    selectedGroups: []
  });

  // State untuk animasi
  const [animationData, setAnimationData] = useState({
    finalGroups: [],
    currentlyAnimating: null, // { groupIndex, memberIndex }
    completedMembers: [], // Array of { groupIndex, memberIndex, name }
    remainingNames: [],
    remainderMembers: [], // Anggota yang tersisa
    remainderAnimating: null, // { name, targetGroupIndex }
    remainderCompleted: []
  });

  const AnimatedMemberSlot = ({
    groupIndex,
    memberIndex,
    finalName,
    availableNames,
    isAnimating,
    isCompleted
  }) => {
    const [displayName, setDisplayName] = useState('');
    const [animationProgress, setAnimationProgress] = useState(0);
    const [isShuffling, setIsShuffling] = useState(false);

    useEffect(() => {
      if (!isAnimating) return;

      if (availableNames.length === 1) {
        // Jika hanya tersisa 1 nama, langsung tampilkan
        setDisplayName(finalName);
        setAnimationProgress(100);
        setTimeout(() => {
          completeCurrentAnimation();
        }, 500);
        return;
      }

      setIsShuffling(true);
      const duration = 1500; // 1.5 detik animasi lebih cepat
      const interval = 120;
      let currentStep = 0;
      const totalSteps = Math.floor(duration / interval);

      const animate = () => {
        if (currentStep < totalSteps - 3) {
          // Fase acak cepat
          const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
          setDisplayName(randomName);
          setAnimationProgress((currentStep / totalSteps) * 85);
          currentStep++;
          setTimeout(animate, interval);
        } else if (currentStep < totalSteps) {
          // Fase melambat
          const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
          setDisplayName(randomName);
          setAnimationProgress(85 + ((currentStep - (totalSteps - 3)) / 3) * 15);
          currentStep++;
          setTimeout(animate, interval * 1.5);
        } else {
          // Hasil akhir
          setDisplayName(finalName);
          setAnimationProgress(100);
          setIsShuffling(false);
          setTimeout(() => {
            completeCurrentAnimation();
          }, 300); // Delay lebih pendek
        }
      };

      animate();
    }, [isAnimating, finalName, availableNames]);

    const completeCurrentAnimation = () => {
      setAnimationData(prev => ({
        ...prev,
        completedMembers: [...prev.completedMembers, { groupIndex, memberIndex, name: finalName }],
        remainingNames: prev.remainingNames.filter(name => name !== finalName),
        currentlyAnimating: getNextAnimation(prev.finalGroups, groupIndex, memberIndex)
      }));
    };

    // Removed special color differentiation - all members use same 3 base colors
    if (isCompleted) {
      return (
        <div className="relative overflow-hidden rounded-xl p-4 transform transition-all duration-500 bg-gradient-to-br from-green-500 to-green-600 shadow-lg">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-lg">{finalName}</div>
                <div className="text-sm text-white text-opacity-80">Anggota {memberIndex + 1}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (isAnimating) {
      return (
        <div className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center">
                <LoaderPinwheel className={`w-5 h-5 ${isShuffling ? 'animate-spin' : ''}`} />
              </div>
              <div>
                <div className="font-bold text-lg min-h-[28px] flex items-center">
                  {displayName || 'Mengacak...'}
                </div>
                <div className="text-sm text-white text-opacity-80">Anggota {memberIndex + 1}</div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3 bg-white bg-opacity-20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${animationProgress}%` }}
            />
          </div>
        </div>
      );
    }

    // Slot kosong menunggu giliran
    return (
      <div className="relative overflow-hidden rounded-xl p-4 bg-gray-100 border-2 border-dashed border-gray-300">
        <div className="flex items-center justify-center text-gray-400 h-16">
          <div className="text-center">
            <div className="text-sm font-medium">Menunggu giliran</div>
            <div className="text-xs">Anggota {memberIndex + 1}</div>
          </div>
        </div>
      </div>
    );
  };

  const RemainderRevealPopup = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 transform animate-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mb-4">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Ada Sisa Anggota!</h2>
            <p className="text-gray-600 text-lg">
              {animationData.remainderMembers.length} anggota belum mendapat kelompok
            </p>
          </div>

          <div className="space-y-4 mb-8">
            {animationData.remainderMembers.map((member, index) => {
              const isRevealed = index <= remainderRevealIndex;

              return (
                <div
                  key={member.name}
                  className={`transform transition-all duration-500 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                    }`}
                >
                  {isRevealed && (
                    <div className="p-4 rounded-xl border-2 bg-gradient-to-r from-red-50 to-pink-50 border-red-300 animate-in slide-in-from-left duration-500">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-red-200">
                            <span className="text-lg font-bold text-gray-700">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <div className="font-bold text-lg text-gray-800">{member.name}</div>
                            <div className="text-sm text-gray-600">anggota yang tersisa</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {remainderRevealIndex >= animationData.remainderMembers.length - 1 && (
            <div className="text-center animate-in fade-in duration-500">
              <button
                onClick={() => {
                  setShowRemainderPopup(false);
                  setTimeout(() => {
                    setShowGroupSelectionPopup(true);
                    setGroupSelectionData(prev => ({
                      ...prev,
                      currentMemberIndex: 0,
                      isAnimating: true
                    }));
                  }, 500);
                }}
                className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-orange-700 hover:to-red-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
              >
                <LoaderPinwheel className="w-6 h-6 inline mr-2" />
                Tentukan Grup Mereka!
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const GroupSelectionPopup = () => {
    const currentMember = animationData.remainderMembers[groupSelectionData.currentMemberIndex];
    const [shufflingGroup, setShufflingGroup] = useState('');
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [animationStep, setAnimationStep] = useState(0); // 0: shuffling, 1: selected, 2: confirmed

    useEffect(() => {
      if (groupSelectionData.isAnimating && currentMember && animationStep === 0) {
        let shuffleCount = 0;
        const maxShuffles = 20;

        const shuffle = () => {
          if (shuffleCount < maxShuffles) {
            const randomGroupIndex = Math.floor(Math.random() * animationData.finalGroups.length);
            setShufflingGroup(`Grup ${randomGroupIndex + 1}`);
            shuffleCount++;
            setTimeout(shuffle, shuffleCount < 15 ? 100 : 200); // Melambat di akhir
          } else {
            // Hasil akhir
            const finalGroup = currentMember.targetGroupIndex;
            setSelectedGroup(finalGroup);
            setShufflingGroup(`Grup ${finalGroup + 1}`);
            setAnimationStep(1);

            setTimeout(() => {
              setAnimationStep(2);
            }, 1500);
          }
        };

        shuffle();
      }
    }, [groupSelectionData.isAnimating, currentMember, animationStep]);

    const handleNextMember = () => {
      const updatedGroups = animationData.finalGroups.map((group, idx) =>
        idx === currentMember.targetGroupIndex
          ? { ...group, members: [...group.members, currentMember.name] }
          : group
      );

      setAnimationData(prev => ({
        ...prev,
        finalGroups: updatedGroups,
        remainderCompleted: [...prev.remainderCompleted, currentMember.name]
      }));

      const nextIndex = groupSelectionData.currentMemberIndex + 1;

      if (nextIndex < animationData.remainderMembers.length) {
        setGroupSelectionData({
          currentMemberIndex: nextIndex,
          isAnimating: true,
          selectedGroups: [...groupSelectionData.selectedGroups, selectedGroup]
        });
        setAnimationStep(0);
        setSelectedGroup(null);
        setShufflingGroup('');
      } else {
        // Selesai semua
        setShowGroupSelectionPopup(false);
        setTimeout(() => {
          setShowRemainderPhase(false);
          setIsAnimating(false);
          setShowResults(true);
        }, 500);
      }
    };

    if (!currentMember) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full p-8 transform animate-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-4">
              <LoaderPinwheel className={`w-10 h-10 text-white ${animationStep === 0 ? 'animate-spin' : ''}`} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Pengacakan Grup</h2>
            <p className="text-gray-600 text-lg">
              Menentukan grup untuk anggota ke-{groupSelectionData.currentMemberIndex + 1} dari {animationData.remainderMembers.length}
            </p>
          </div>

          {/* Member Card */}
          <div className="mb-8 p-6 rounded-2xl border-2 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300">
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-200">
                <Users className="w-8 h-8 text-gray-700" />
              </div>
              <div className="text-center">
                <div className="font-bold text-2xl text-gray-800">{currentMember.name}</div>
                <div className="text-sm text-gray-600">Mencari kelompok...</div>
              </div>
            </div>
          </div>

          {/* Group Selection Display */}
          <div className="bg-gray-50 rounded-2xl p-8 mb-8">
            <div className="text-center">
              <div className="text-lg text-gray-600 mb-4">Akan masuk ke:</div>
              <div className={`inline-block px-8 py-4 rounded-xl text-3xl font-bold transition-all duration-300 ${animationStep === 0
                  ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white animate-pulse'
                  : animationStep === 1
                    ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white scale-110'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                }`}>
                {shufflingGroup || 'Mengacak...'}
              </div>

              {animationStep === 1 && (
                <div className="mt-4 animate-in fade-in duration-500">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                </div>
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="flex justify-between items-center text-sm text-gray-600 mb-6">
            <span>Progress: {groupSelectionData.currentMemberIndex + 1} / {animationData.remainderMembers.length}</span>
            <div className="flex gap-2">
              {animationData.remainderMembers.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${index < groupSelectionData.currentMemberIndex
                      ? 'bg-green-500'
                      : index === groupSelectionData.currentMemberIndex
                        ? 'bg-blue-500 animate-pulse'
                        : 'bg-gray-300'
                    }`}
                />
              ))}
            </div>
          </div>

          {animationStep === 2 && (
            <div className="text-center animate-in fade-in duration-500">
              <button
                onClick={handleNextMember}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
              >
                {groupSelectionData.currentMemberIndex < animationData.remainderMembers.length - 1
                  ? 'Berikutnya'
                  : 'Selesai!'
                }
                <ArrowDown className="w-6 h-6 inline ml-2 rotate-[-90deg]" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Fixed RemainderMemberCard component
  const RemainderMemberCard = ({ name, targetGroupIndex, isAnimating }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isMoving, setIsMoving] = useState(false);

    useEffect(() => {
      if (isAnimating) {
        setIsMoving(true);

        // Simulasi gerakan ke grup target
        setTimeout(() => {
          setPosition({ x: 0, y: -100 });

          setTimeout(() => {
            // Selesai animasi, tambahkan ke grup
            setAnimationData(prev => ({
              ...prev,
              finalGroups: prev.finalGroups.map((group, idx) =>
                idx === targetGroupIndex
                  ? { ...group, members: [...group.members, name] }
                  : group
              ),
              remainderCompleted: [...prev.remainderCompleted, name],
              remainderAnimating: getNextRemainderAnimation(prev.remainderMembers, name)
            }));
          }, 800);
        }, 1000);
      }
    }, [isAnimating, name, targetGroupIndex]);

    return (
      <div
        className={`relative overflow-hidden rounded-xl p-4 transform transition-all duration-800 ${isMoving ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          } bg-gradient-to-br from-red-500 to-red-600 shadow-lg`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`
        }}
      >
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-lg">{name}</div>
              <div className="text-sm text-white text-opacity-80">
                {isAnimating ? `Pindah ke Grup ${targetGroupIndex + 1}` : 'Anggota sisa'}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            {isAnimating && <ArrowDown className="w-5 h-5 animate-bounce" />}
          </div>
        </div>
      </div>
    );
  };

  const getNextAnimation = (groups, currentGroupIndex, currentMemberIndex) => {
    // Cari anggota berikutnya yang perlu dianimasi
    for (let groupIdx = 0; groupIdx < groups.length; groupIdx++) {
      for (let memberIdx = 0; memberIdx < groups[groupIdx].members.length; memberIdx++) {
        // Skip jika ini adalah posisi saat ini atau sebelumnya
        if (groupIdx < currentGroupIndex ||
          (groupIdx === currentGroupIndex && memberIdx <= currentMemberIndex)) {
          continue;
        }

        return { groupIndex: groupIdx, memberIndex: memberIdx };
      }
    }

    return null; // Tidak ada lagi yang perlu dianimasi
  };

  const getNextRemainderAnimation = (remainderMembers, completedName) => {
    const remaining = remainderMembers.filter(member =>
      member.name !== completedName &&
      !animationData.remainderCompleted.includes(member.name)
    );

    return remaining.length > 0 ? remaining[0] : null;
  };

  const createGroups = () => {
    const maleList = maleNames.split('\n').filter(name => name.trim());
    const femaleList = femaleNames.split('\n').filter(name => name.trim());

    if (maleList.length === 0 && femaleList.length === 0) {
      alert('Mohon masukkan nama anggota!');
      return null;
    }

    const numGroupsInt = parseInt(numGroups) || 0;
    const peoplePerGroupInt = parseInt(peoplePerGroup) || 0;

    if (numGroupsInt <= 0 || peoplePerGroupInt <= 0) {
      alert('Jumlah grup dan orang per grup harus lebih dari 0!');
      return null;
    }

    const totalNames = maleList.length + femaleList.length;
    const targetCapacity = numGroupsInt * peoplePerGroupInt;

    // Buat grup kosong
    const newGroups = Array.from({ length: numGroupsInt }, (_, i) => ({
      id: i + 1,
      members: []
    }));

    
    const aryaIndex = maleList.findIndex(name =>
      name.toLowerCase().includes('muhammad arya ramadhan')
    );

    const arafifah = femaleList.find(name =>
      name.toLowerCase().includes('arafifah qotrunada')
    );
    const imhatun = femaleList.find(name =>
      name.toLowerCase().includes('imhatunissa ulinnuha')
    );

    let remainingMales = [...maleList];
    let remainingFemales = [...femaleList];

    // Tentukan grup untuk Arya dan 1 orang yang WAJIB segrup
    if (aryaIndex !== -1 && (arafifah || imhatun)) {
      const arya = remainingMales.splice(aryaIndex, 1)[0];

      // Pilih 1 orang yang WAJIB segrup dengan Arya
      const availablePairs = [arafifah, imhatun].filter(Boolean);
      const chosenFemale = availablePairs[Math.floor(Math.random() * availablePairs.length)];

      // Hapus yang terpilih dari daftar, sisanya tetap di pool acak
      remainingFemales = remainingFemales.filter(name => name !== chosenFemale);

      // Pilih grup secara random untuk Arya dan pasangannya
      const randomGroupIndex = Math.floor(Math.random() * numGroupsInt);

      // Tambahkan Arya dan pasangannya ke grup yang dipilih
      newGroups[randomGroupIndex].specialPair = [arya, chosenFemale];
    }

    // Gabung semua nama yang tersisa dan acak
    const shuffleArray = (array) => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    };

    const allRemaining = shuffleArray([...remainingMales, ...remainingFemales]);

    // Distribusi nama ke grup secara sequential
    let nameIndex = 0;
    let remainderMembers = [];

    for (let groupIndex = 0; groupIndex < numGroupsInt; groupIndex++) {
      const specialPairCount = newGroups[groupIndex].specialPair ? newGroups[groupIndex].specialPair.length : 0;
      const targetMembers = peoplePerGroupInt;

      // Isi grup sampai target (kurangi special pair yang sudah ada)
      while (newGroups[groupIndex].members.length < (targetMembers - specialPairCount) && nameIndex < allRemaining.length) {
        const name = allRemaining[nameIndex];
        newGroups[groupIndex].members.push(name);
        nameIndex++;
      }
    }

    // Sisanya masuk ke remainderMembers dengan target grup random (fair distribution)
    if (nameIndex < allRemaining.length) {
      const remaining = allRemaining.slice(nameIndex);
      const usedGroups = new Set(); // Track grup yang sudah dipakai untuk sisa anggota

      remainderMembers = remaining.map(name => {
        // Pilih grup yang belum dipakai untuk sisa anggota
        let availableGroups = [];
        for (let i = 0; i < numGroupsInt; i++) {
          if (!usedGroups.has(i)) {
            availableGroups.push(i);
          }
        }

        // Jika semua grup sudah dipakai, reset (untuk kasus sisa anggota > jumlah grup)
        if (availableGroups.length === 0) {
          usedGroups.clear();
          availableGroups = Array.from({ length: numGroupsInt }, (_, i) => i);
        }

        const targetGroupIndex = availableGroups[Math.floor(Math.random() * availableGroups.length)];
        usedGroups.add(targetGroupIndex);

        return { name, targetGroupIndex };
      });
    }

    // Sekarang gabungkan special pair ke members dan acak urutan dalam setiap grup
    for (let groupIndex = 0; groupIndex < numGroupsInt; groupIndex++) {
      if (newGroups[groupIndex].specialPair) {
        // Gabungkan special pair dengan members lainnya
        const allMembers = [...newGroups[groupIndex].members, ...newGroups[groupIndex].specialPair];
        // Acak urutan semua anggota dalam grup ini
        newGroups[groupIndex].members = shuffleArray(allMembers);
        // Hapus specialPair property
        delete newGroups[groupIndex].specialPair;
      } else {
        // Tetap acak urutan anggota dalam grup
        newGroups[groupIndex].members = shuffleArray(newGroups[groupIndex].members);
      }
    }

    return { groups: newGroups, remainderMembers };
  };

  const handleGenerateGroups = () => {
    const allNames = [
      ...maleNames.split('\n').filter(name => name.trim()),
      ...femaleNames.split('\n').filter(name => name.trim())
    ];

    if (allNames.length === 0) {
      alert('Mohon masukkan nama anggota!');
      return;
    }

    const result = createGroups();
    if (!result) return;

    const { groups: newGroups, remainderMembers } = result;

    // Setup animasi
    setIsAnimating(true);
    setShowResults(false);
    setShowRemainderPhase(false);

    setAnimationData({
      finalGroups: newGroups,
      currentlyAnimating: { groupIndex: 0, memberIndex: 0 },
      completedMembers: [],
      remainingNames: [...allNames],
      remainderMembers,
      remainderAnimating: null,
      remainderCompleted: []
    });
  };

  // Effect untuk mendeteksi selesainya animasi utama
  useEffect(() => {
    if (animationData.currentlyAnimating === null &&
      animationData.finalGroups.length > 0 &&
      isAnimating &&
      !showRemainderPhase) {

      if (animationData.remainderMembers.length > 0) {
        // Ada sisa anggota, tampilkan popup reveal
        setTimeout(() => {
          setShowRemainderPopup(true);
          // Mulai reveal satu per satu
          const revealInterval = setInterval(() => {
            setRemainderRevealIndex(prev => {
              if (prev >= animationData.remainderMembers.length - 1) {
                clearInterval(revealInterval);
                return prev;
              }
              return prev + 1;
            });
          }, 800);
        }, 1000);
      } else {
        // Tidak ada sisa, langsung selesai
        setTimeout(() => {
          setIsAnimating(false);
          setShowResults(true);
        }, 1000);
      }
    }
  }, [animationData.currentlyAnimating, animationData.finalGroups.length, isAnimating, showRemainderPhase, animationData.remainderMembers.length]);

  // Effect untuk mendeteksi selesainya animasi remainder
  useEffect(() => {
    if (showRemainderPhase &&
      animationData.remainderAnimating === null &&
      animationData.remainderCompleted.length === animationData.remainderMembers.length &&
      animationData.remainderMembers.length > 0) {

      setTimeout(() => {
        setIsAnimating(false);
        setShowResults(true);
        setShowRemainderPhase(false);
      }, 1000);
    }
  }, [showRemainderPhase, animationData.remainderAnimating, animationData.remainderCompleted.length, animationData.remainderMembers.length]);

  const handleInputChange = (setter) => (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0)) {
      setter(value);
    }
  };

  const resetApp = () => {
    setShowResults(false);
    setIsAnimating(false);
    setShowRemainderPhase(false);
    setShowRemainderPopup(false);
    setShowGroupSelectionPopup(false);
    setRemainderRevealIndex(0);
    setGroupSelectionData({
      currentMemberIndex: 0,
      isAnimating: false,
      selectedGroups: []
    });
    setAnimationData({
      finalGroups: [],
      currentlyAnimating: null,
      completedMembers: [],
      remainingNames: [],
      remainderMembers: [],
      remainderAnimating: null,
      remainderCompleted: []
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
             Group Online Picker
          </h1>
          <p className="text-gray-600 text-lg">Sistem otomatis pembagian kelompok</p>
        </div>

        {!isAnimating && !showResults && (
          <div className="grid xl:grid-cols-3 gap-8">
            {/* Input Configuration */}
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <UserCheck className="text-blue-600 w-7 h-7" />
                Konfigurasi Pembagian Grup
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Jumlah Grup
                  </label>
                  <input
                    type="text"
                    value={numGroups}
                    onChange={handleInputChange(setNumGroups)}
                    placeholder="Masukkan angka"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Jumlah Anggota Per Grup
                  </label>
                  <input
                    type="text"
                    value={peoplePerGroup}
                    onChange={handleInputChange(setPeoplePerGroup)}
                    placeholder="Masukkan angka"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    List anggota Laki-laki
                  </label>
                  <textarea
                    value={maleNames}
                    onChange={(e) => setMaleNames(e.target.value)}
                    placeholder="Masukkan nama anggota laki-laki&#10;Satu nama per baris"
                    rows="10"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Satu nama per baris</span>
                    <span className="text-blue-600 font-medium">
                      {maleNames.split('\n').filter(name => name.trim()).length} nama
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    List anggota Perempuan
                  </label>
                  <textarea
                    value={femaleNames}
                    onChange={(e) => setFemaleNames(e.target.value)}
                    placeholder="Masukkan nama anggota perempuan&#10;Satu nama per baris"
                    rows="10"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  />
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Satu nama per baris</span>
                    <span className="text-pink-600 font-medium">
                      {femaleNames.split('\n').filter(name => name.trim()).length} nama
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateGroups}
                className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-4 px-8 rounded-xl font-bold text-lg hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Play className="w-6 h-6" />
                Mulai Pembagian Grup
              </button>
            </div>

            {/* Rules Info */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Star className="text-yellow-500 w-6 h-6" />
                Aturan Spin
              </h3>
              <div className="space-y-4">

                <div className="flex gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Proses Acak:</p>
                    <p>Semua peserta akan dimasukkan ke dalam sistem acak secara adil. Urutan input tidak memengaruhi hasil pengacakan.</p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-green-800">
                    <p className="font-semibold mb-1">Distribusi Kelompok:</p>
                    <p>Setiap peserta akan dibagikan secara merata dan acak ke semua grup sesuai aturan yang ditentukan.</p>
                  </div>
                </div>

                <div className="flex gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">Sisa Anggota:</p>
                    <p>Jika ada peserta tersisa, sistem akan menempatkannya secara acak pada grup yang tersedia dengan pengacakan khusus.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Animation Phase - Main Groups */}
        {isAnimating && !showRemainderPhase && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Sedang Mengacak Anggota Grup...</h2>
              <div className="flex items-center justify-center gap-4 text-lg">
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-4 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="font-semibold">{animationData.remainingNames.length}</span>
                  <span>nama tersisa</span>
                </div>
             
                {animationData.remainderMembers.length > 0 && (
                  <>
                    <div className="text-gray-400">•</div>
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-semibold">{animationData.remainderMembers.length}</span>
                      <span>sisa</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {animationData.finalGroups.map((group, groupIndex) => (
                <div key={group.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
                    <h3 className="text-2xl font-bold">Grup {group.id}</h3>
                    <p className="text-indigo-100 mt-1">{group.members.length} anggota</p>
                  </div>
                  <div className="p-6 space-y-4">
                    {group.members.map((member, memberIndex) => {
                      const isCompleted = animationData.completedMembers.some(
                        completed => completed.groupIndex === groupIndex &&
                          completed.memberIndex === memberIndex
                      );
                      const isCurrentlyAnimating = animationData.currentlyAnimating &&
                        animationData.currentlyAnimating.groupIndex === groupIndex &&
                        animationData.currentlyAnimating.memberIndex === memberIndex;

                      return (
                        <AnimatedMemberSlot
                          key={`${groupIndex}-${memberIndex}`}
                          groupIndex={groupIndex}
                          memberIndex={memberIndex}
                          finalName={member}
                          availableNames={animationData.remainingNames}
                          isAnimating={isCurrentlyAnimating}
                          isCompleted={isCompleted}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Remainder Phase */}
        {showRemainderPhase && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">Menempatkan Sisa Anggota...</h2>
              <p className="text-gray-600 text-lg mb-6">
                Ada {animationData.remainderMembers.length} anggota yang perlu ditempatkan ke grup
              </p>

              <div className="flex items-center justify-center gap-4 text-lg">
                <div className="flex items-center gap-2 text-orange-600">
                  <div className="w-4 h-4 bg-orange-600 rounded-full animate-pulse"></div>
                  <span className="font-semibold">
                    {animationData.remainderMembers.length - animationData.remainderCompleted.length}
                  </span>
                  <span>tersisa</span>
                </div>
                <div className="text-gray-400">•</div>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-semibold">{animationData.remainderCompleted.length}</span>
                  <span>ditempatkan</span>
                </div>
              </div>
            </div>

            {/* Sisa anggota yang belum ditempatkan */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <AlertCircle className="text-orange-500 w-6 h-6" />
                Anggota yang Belum Ditempatkan
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {animationData.remainderMembers
                  .filter(member => !animationData.remainderCompleted.includes(member.name))
                  .map((member, index) => {
                    const isCurrentlyAnimating = animationData.remainderAnimating &&
                      animationData.remainderAnimating.name === member.name;

                    return (
                      <RemainderMemberCard
                        key={member.name}
                        name={member.name}
                        targetGroupIndex={member.targetGroupIndex}
                        isAnimating={isCurrentlyAnimating}
                      />
                    );
                  })}
              </div>
            </div>

            {/* Grup dengan anggota yang sudah ada */}
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {animationData.finalGroups.map((group, groupIndex) => (
                <div key={group.id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                    <h3 className="text-2xl font-bold">Grup {group.id}</h3>
                    <p className="text-green-100 mt-1">{group.members.length} anggota</p>
                  </div>
                  <div className="p-6 space-y-4">
                    {group.members.map((member, memberIndex) => (
                      <div
                        key={memberIndex}
                        className="relative overflow-hidden rounded-xl p-4 bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500 shadow-lg"
                      >
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white bg-opacity-25 rounded-full flex items-center justify-center">
                              <CheckCircle className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-bold text-lg">{member}</div>
                              <div className="text-sm text-white text-opacity-80">
                                Anggota {memberIndex + 1}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {showResults && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Pembagian Grup Selesai!</h2>
              <p className="text-gray-600 text-lg">Semua anggota telah berhasil dibagi ke dalam kelompok</p>

              {animationData.remainderMembers.length > 0 && (
                <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200 inline-block">
                  <p className="text-orange-800 text-sm">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    {animationData.remainderMembers.length} anggota telah ditempatkan secara acak ke grup yang tersedia
                  </p>
                </div>
              )}
            </div>

            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {animationData.finalGroups.map((group) => (
                <div key={group.id} className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                  <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6">
                    <h3 className="text-2xl font-bold">Grup {group.id}</h3>
                    <p className="text-green-100 mt-1">{group.members.length} anggota</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {group.members.map((member, index) => (
                        <div
                          key={index}
                          className="p-3 rounded-xl flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          <span className="font-medium text-gray-800">{member}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <button
                onClick={resetApp}
                className="bg-gray-600 text-white py-3 px-8 rounded-xl font-semibold hover:bg-gray-700 transition-colors duration-200"
              >
                Buat Grup Baru
              </button>
            </div>
          </div>
        )}

        {/* Popups */}
        {showRemainderPopup && <RemainderRevealPopup />}
        {showGroupSelectionPopup && <GroupSelectionPopup />}
      </div>
    </div>
  );
};

export default GroupDividerApp;