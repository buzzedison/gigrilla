"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Save, Plus, Edit2, Trash2, CheckCircle2, Circle } from "lucide-react";

interface ArtistMember {
  id: string;
  firstName: string;
  nickname: string;
  lastName: string;
  dateOfBirth: string;
  role: string;
  incomeShare: number;
  displayAge: boolean;
}

export function ArtistMembersManager() {
  const [members, setMembers] = useState<ArtistMember[]>([
    {
      id: "1",
      firstName: "Ashton",
      nickname: "Ash",
      lastName: "Kutcher",
      dateOfBirth: "1978-02-07",
      role: "Lead Singer",
      incomeShare: 20,
      displayAge: true
    },
    {
      id: "2",
      firstName: "Ashley",
      nickname: "Katch",
      lastName: "Kutcher",
      dateOfBirth: "1995-05-29",
      role: "Drummer",
      incomeShare: 10,
      displayAge: false
    }
  ]);

  const [newMember, setNewMember] = useState({
    firstName: "",
    nickname: "",
    lastName: "",
    dateOfBirth: "",
    role: "",
    incomeShare: 0,
    displayAge: true
  });

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setNewMember(prev => ({ ...prev, [field]: value }));
  };

  const addMember = () => {
    if (!newMember.firstName || !newMember.lastName || !newMember.role) return;

    const member: ArtistMember = {
      id: Date.now().toString(),
      ...newMember
    };

    setMembers(prev => [...prev, member]);
    setNewMember({
      firstName: "",
      nickname: "",
      lastName: "",
      dateOfBirth: "",
      role: "",
      incomeShare: 0,
      displayAge: true
    });
  };

  const updateMember = (id: string, updates: Partial<ArtistMember>) => {
    setMembers(prev => prev.map(member =>
      member.id === id ? { ...member, ...updates } : member
    ));
  };

  const deleteMember = (id: string) => {
    setMembers(prev => prev.filter(member => member.id !== id));
  };

  const getAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <div className="space-y-6">
      {/* Add New Member Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Artist Member Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <Input
              value={newMember.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              placeholder="First Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nickname</label>
            <Input
              value={newMember.nickname}
              onChange={(e) => handleInputChange('nickname', e.target.value)}
              placeholder="Nickname"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <Input
              value={newMember.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              placeholder="Last Name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <Input
              type="date"
              value={newMember.dateOfBirth}
              onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
              placeholder="dd/mm/yyyy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role(s)</label>
            <Select value={newMember.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lead Singer">Lead Singer</SelectItem>
                <SelectItem value="Keyboardist">Keyboardist</SelectItem>
                <SelectItem value="Drummer">Drummer</SelectItem>
                <SelectItem value="Guitarist">Guitarist</SelectItem>
                <SelectItem value="Bassist">Bassist</SelectItem>
                <SelectItem value="Backing Vocalist">Backing Vocalist</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Producer">Producer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Share of Income</label>
            <div className="relative">
              <Input
                type="number"
                value={newMember.incomeShare || ''}
                onChange={(e) => handleInputChange('incomeShare', parseFloat(e.target.value) || 0)}
                placeholder="xx.xx"
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">can be edited later per Track/Gig</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            id="displayAge"
            checked={newMember.displayAge}
            onChange={(e) => handleInputChange('displayAge', e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="displayAge" className="text-sm text-gray-700">Display Age On Profile</label>
        </div>

        <Button
          onClick={addMember}
          disabled={!newMember.firstName || !newMember.lastName || !newMember.role}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Member
        </Button>
      </div>

      {/* Artist Members List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Artist Members</h3>

        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {member.firstName} {member.nickname && `"${member.nickname}"`} {member.lastName}
                </h4>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewMember({
                        firstName: member.firstName,
                        nickname: member.nickname,
                        lastName: member.lastName,
                        dateOfBirth: member.dateOfBirth,
                        role: member.role,
                        incomeShare: member.incomeShare,
                        displayAge: member.displayAge
                      });
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMember(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Role: </span>
                  <span className="font-medium">{member.role}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date of Birth: </span>
                  <span className="font-medium">{new Date(member.dateOfBirth).toLocaleDateString()}</span>
                  {member.displayAge && (
                    <span className="text-gray-500 ml-2">
                      (Age: {getAge(member.dateOfBirth)})
                    </span>
                  )}
                  {!member.displayAge && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      Do Not Display Age On Profile
                    </Badge>
                  )}
                </div>
                <div>
                  <span className="text-gray-600">Share of Income: </span>
                  <span className="font-medium">{member.incomeShare}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" className="px-8">
          <Save className="w-4 h-4 mr-2" />
          Save Members
        </Button>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8">
          Publish Members
        </Button>
      </div>
    </div>
  );
}
